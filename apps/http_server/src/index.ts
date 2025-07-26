import express from "express";
import bcrypt from "bcrypt";
import { prismaclient } from "@repo/database/client";
import { usersigninschema, usersignupschema } from "@repo/zod_schema/users";
import jwt from "jsonwebtoken";
const dotenv = require("dotenv");

const app = express();
dotenv.config({ path: "../../.env" });
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "home api",
  });
});

app.post("/signup", async (req, res) => {
  const parsedbody = usersignupschema.safeParse(req.body);
  if (!parsedbody.success) {
    res.json({
      message: "incomplete details",
      errors: parsedbody.error,
    });
    return;
  } else {
    const userexists = await prismaclient.user.findFirst({
      where: {
        email: parsedbody.data.email,
      },
    });
    if (userexists) {
      res.json({
        message: "user already exists with",
        email: parsedbody.data.email,
      });
      return;
    }
    const hashedpassword = await bcrypt.hash(parsedbody.data.password, 10);
    const user = await prismaclient.user.create({
      data: {
        email: parsedbody.data.email,
        firstname: parsedbody.data.firstname,
        lastname: parsedbody.data.lastname,
        password: hashedpassword,
        photo: parsedbody.data?.photo,
      },
    });
    res.json({
      messaage: "user created",
      userdetails: user,
    });
  }
});

app.post("/signin", async (req, res) => {
  const parsedbody = usersigninschema.safeParse(req.body);
  if (!parsedbody.success) {
    res.json({
      message: "incomplete credentials",
      error: parsedbody.error,
    });
    return;
  } else {
    const user = await prismaclient.user.findFirst({
      where: {
        email: parsedbody.data.email,
      },
    });
    if (!user) {
      res.json({
        message: "email doesnt exists",
      });
    } else {
      const passwordmatch = await bcrypt.compare(
        parsedbody.data.password,
        user.password
      );
      if (!passwordmatch) {
        res.json({
          message: "password incorrect",
        });
        return;
      } else {
        if (process.env.JWT_SECRET) {
          const token = jwt.sign(
            {
              email: parsedbody.data.email,
              userId: user.userId,
            },
            process.env.JWT_SECRET
          );
          res.json({
            message: "signin successful",
            token: token,
          });
        }
      }
    }
  }
});

app.post("/create-room", (req, res) => {
  res.json({
    message: "create-room endpoint",
  });
});

app.listen(8000, () => {
  console.log("http server on port 8000");
});
