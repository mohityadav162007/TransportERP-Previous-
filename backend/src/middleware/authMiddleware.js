import jwt from "jsonwebtoken";

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers["authorization"];
    const token = (req.cookies && req.cookies.token) || (authHeader && authHeader.split(" ")[1]) || req.query.token;

    if (token == null) return res.sendStatus(401);

    jwt.verify(token, process.env.JWT_SECRET || "default_secret", (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

export default authenticateToken;
