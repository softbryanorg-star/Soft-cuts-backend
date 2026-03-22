const attempts = new Map();

export const loginLimiter = (req, res, next) => {
  const ip = req.ip;

  if (!attempts.has(ip)) {
    attempts.set(ip, { count: 0, blockUntil: null });
  }

  const data = attempts.get(ip);

  // Check if blocked
  if (data.blockUntil && Date.now() < data.blockUntil) {
    return res.status(429).json({
      message: "Too many attempts. Try again later.",
    });
  }

  req.rateData = data;
  next();
};

// Call this when login fails
export const recordFailedAttempt = (ip) => {
  const data = attempts.get(ip);

  data.count += 1;

  if (data.count >= 9) {
    data.blockUntil = Date.now() + 15 * 60 * 1000; // 15 minutes
    data.count = 0;
  }
};

// Reset on success
export const resetAttempts = (ip) => {
  attempts.delete(ip);
};