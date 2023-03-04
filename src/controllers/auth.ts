import * as bcrypt from "bcrypt";
import { gql } from "graphql-request";
import { client } from "../client";
import { generateJWT } from "../jwt";

export const register = async (req, res) => {
    const { email, password } = req.body as Record<string, string>;;
  
    // In production app, you would check if user is already registered
    // We skip that in this tutorial for the sake of time
  
    // We insert the user using a mutation
    // Note that we salt and hash the password using bcrypt
    const { insert_user_one } = await client.request(
      gql`
        mutation registerUser($user: user_insert_input!) {
          insert_user_one(object: $user) {
            id
          }
        }
      `,
      {
        user: {
          email,
          password: await bcrypt.hash(password, 10),
        },
      }
    ) as any;
  
    const { id: userId } = insert_user_one;
  
    res.send({
      token: generateJWT({
        defaultRole: "admin_jr_1",
        allowedRoles: ["admin_jr_1"],
        otherClaims: {
          "X-Hasura-User-Id": userId,
        },
      }),
    });
  }


export const login = async (req, res) => {
    const { email, password } = req.body as Record<string, string>;
  
    let { user } = await client.request(
      gql`
        query getUserByEmail($email: String!) {
          user(where: { email: { _eq: $email } }) {
            id
            password
          }
        }
      `,
      {
        email,
      }
    ) as any;
  
    // Since we filtered on a non-primary key we got an array back
    user = user[0];
  
    if (!user) {
      res.sendStatus(401);
      return;
    }
  
    // Check if password matches the hashed version
    const passwordMatch = await bcrypt.compare(password, user.password);
  
    if (passwordMatch) {
      res.send({
        token: generateJWT({
          defaultRole: "user",
          allowedRoles: ["user"],
          otherClaims: {
            "X-Hasura-User-Id": user.id,
          },
        }),
      });
    } else {
      res.sendStatus(401);
    }
  }