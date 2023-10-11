import * as yup from 'yup';
import { isValidObjectId } from 'mongoose';
import { categories } from './audio_category';

export const CreateUserSchema = yup.object().shape({
  name: yup.string().trim().required("Name is required!").min(3, "Name is too short!").max(20, 'Name is too long!'),
  email: yup.string().required("Email is required").email("Invalid email"),
  password: yup.string().trim().required("Password is required").min(6, "Password is too short")
    .matches(
      /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#\$%\^&\*])[a-zA-Z\d!@#\$%\^&\*]+$/,
      "Password is too simple!"
    ),
});

export const TokenAndIdValidation = yup.object().shape({
  token: yup.string().trim().required("Invalid token"),
  userId: yup.string().transform(function (value) {
    if (this.isType(value) && isValidObjectId(value)) {
      return value;
    }
    return "";
  }).required("Invalid userId")
});

export const UpdatePasswordSchema = yup.object().shape({
  token: yup.string().trim().required("Invalid token"),
  userId: yup.string().transform(function (value) {
    if (this.isType(value) && isValidObjectId(value)) {
      return value;
    }
    return "";
  }).required("Invalid userId"),
  password: yup.string().trim().required("Password is required").min(6, "Password is too short")
    .matches(
      /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#\$%\^&\*])[a-zA-Z\d!@#\$%\^&\*]+$/,
      "Password is too simple!"
    ),
});


export const SignInValidationSchema = yup.object().shape({
  email: yup.string().required("Email is required").email("Invalid email"),
  password: yup.string().trim().required("Password is required")
});

export const AudioValidationSchema = yup.object().shape({
  title: yup.string().required("Title is missing"),
  about: yup.string().required("About is missing"),
  category: yup.string().oneOf(categories, "Invalid category!").required("Category is missing")
});