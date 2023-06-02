import * as mongoose from 'mongoose'
import * as bcrypt from 'bcrypt'
import * as EmailValidator from "email-validator";

const userSchema = new mongoose.Schema({
              username: {type: String, required: true},
              name: {type: String, required: true},
              email: {type: String, required: true, unique: true,  lowercase: true, 
                validate: {
                validator: EmailValidator.validate,
                message: (props) => `${props.value} is not valid email address!`,
              },},
              password: {type: String,   minLength: 8, select: false},
              passwordConfirmation: {type: String, required: true, minLength: 8,},
              pic: {type: String,  default: "https://www.transparentpng.com/thumb/user/black-username-png-icon-free--4jlZLb.png" }
}, {
              timestamps: true
})

// Hash the password before saving the user
userSchema.pre('save', async function (next) {
  try {
    if (!this.isModified('password')) {
      return next();
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(this.password, salt);
    this.password = hashedPassword;

    next();
  } catch (error) {
    return next(error);
  }
});

// Add a method to the schema to compare passwords
userSchema.methods.comparePassword = async function (enteredpassword: string) {
  try {
    return await bcrypt.compare(enteredpassword, this.password);
  } catch (error) {
    throw new Error(error);
  }
};

const User = mongoose.model('User', userSchema)


export default User

