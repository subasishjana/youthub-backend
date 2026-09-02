import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { User } from "../models/user.models.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/apiResponse.js"


const registerUser = asyncHandler(async (req, res) => {
  //get user details from frontend
  //validation - not empty
  //check if user already exists : username,email
  //cheack for images,cheack for avatar
  //upload them to cloudinary,avatar
  //create user object-create entry in db
  //remove password and refress token field from response
  //cheack fro user creation
  //return res

  const { fullName, email, username, password } = req.body;
  console.log("email: ", email);
  //    if(fullName === ""){
  //     throw ApiError(400, "full name is must required")
  //    }

  if (
    [fullName, email, username, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All fields are must required");
  }
  const existedUser = User.findOne({
    $or: [{ username }, { email }],
  });
  if (existedUser) {
    throw new ApiError(409, "user with email and username exists");
  }
  const avatarLocalpath = req.files?.avatar[0]?.path;
  const coverImageLocalPath = req.files?.coverImage[0]?.path;

  if (!avatarLocalpath) {
    throw new ApiError(400, "Avatar files is must required");
  }
  const avatar = await uploadOnCloudinary(avatarLocalpath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!avatar) {
    throw new ApiError(400, "Avatar files is must required");
  }

  const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase(),
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(500, "something went wrong while regitering the user");
  }
  return res.status(201).json(
    new ApiResponse(200 , createdUser , "user registered successfully")
  )
});

export { registerUser };
