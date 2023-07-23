import * as mongoose from 'mongoose'
import * as bcrypt from 'bcryptjs'
import * as EmailValidator from "email-validator";

interface UserModel extends Document {
  username: string;
  name: string;
  email: string;
  pic: string;
  password?: string;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema = new mongoose.Schema<UserModel>({
              username: {type: String, required: true, unique: true},
              name: {type: String, required: true},
              email: {type: String, required: true, unique: true,  lowercase: true, 
                validate: {
                validator: EmailValidator.validate,
                message: (props) => `${props.value} is not valid email address!`,
              },},
              password: {type: String,   minLength: 8, select: false},
             // passwordConfirmation: {type: String, required: true, minLength: 8,},
              pic: {type: String,  default: "https://www.transparentpng.com/thumb/user/black-username-png-icon-free--4jlZLb.png" }
}, {
              timestamps: true
})


UserSchema.pre('save', async function(next) {
  var user = this;

  try {
if (!user.isModified('password')) return next();

const salt = await bcrypt.genSalt(10);
   user.password = await bcrypt.hash(user.password, salt);

     next();

    } catch (error) {
           return next(error);
         }


});

UserSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  try {
         return await bcrypt.compare(candidatePassword, this.password);
       } catch (error) {
         throw new Error(error);
       }
};

const User = mongoose.model('User', UserSchema)


export default User

