import crypto from "crypto";
import jwt from "jsonwebtoken";
import {env} from "../config/env.js";
export function signAccessToken(user){return jwt.sign({sub:user._id.toString(),organizationId:user.organization.toString()},env.jwtSecret,{expiresIn:env.jwtExpiresIn})}
export function hashToken(token){return crypto.createHash("sha256").update(token).digest("hex")}
export function createRandomToken(){return crypto.randomBytes(32).toString("hex")}