import * as yup from 'yup';
export const CreateUserSchema = yup.object().shape({
  name: yup.string().trim().required("Name is required!").min(3, "Name is too short!").max(20, 'Name is too long!'),
  email: yup.string().required("Email is required").email("Invalid email"),
  password: yup.string().trim().required("Password is required").min(6, "Password is too short")
    .matches(
      /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#\$%\^&\*])[a-zA-Z\d!@#\$%\^&\*]+$/,
      "Password is too simple!"
    ),
})

