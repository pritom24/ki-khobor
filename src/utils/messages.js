const getMessage = (username, text) => {
  const now = new Date();
  return {
    username,
    text,
    createdAt: now.getTime(),
  };
};

const generateLocationMessage = (username, url) => {
  return {
    username,
    url,
    createdat: new Date().getTime(),
  };
};

module.exports = {
  getMessage,
  generateLocationMessage,
};
