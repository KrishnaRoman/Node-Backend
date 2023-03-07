import * as bcrypt from "bcrypt";
import { gql } from "graphql-request";
import { client } from "../client";
import { generateJWT } from "../jwt";

export const register = async (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
    const { username, email, password, phone, default_role } = req.body;

    if(default_role === ""){
      res.status(500).send();
    }
  
    try {
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
            username,
            email: email.replace(/\s/g,''),
            password: await bcrypt.hash(password, 10),
            phone,
            default_role
          },
        }
      ) as any;
    
      const { id: userId } = insert_user_one;
    
      res.send({
        token: generateJWT({
          defaultRole: default_role,
          otherClaims: {
            "X-Hasura-User-Id": userId,
          },
        }),
      });
    } catch (error) {
      res.status(500).send();
    }
}


export const login = async (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');

  if(!req.body.email && !req.body.password){
    res.sendStatus(401);
    return;
  }

    const { email, password } = req.body as Record<string, string>;
  
    let { user } = await client.request(
      gql`
        query getUserByEmail($email: String!) {
          user(where: { email: { _eq: $email } }) {
            id
            username
            password
            default_role
            deleted
          }
        }
      `,
      {
        email: email.replace(/\s/g,''),
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
  
    if (passwordMatch && !user.deleted) {
      res.header('Access-Control-Allow-Origin', '*');
      res.send({
        token: "Bearer " + generateJWT({
          defaultRole: user.default_role,
          otherClaims: {
            "X-Hasura-User-Id": user.id,
          },
        }),
        username: user.username,
        default_role: user.default_role
      });
    } else {
      res.sendStatus(401);
    }
  }