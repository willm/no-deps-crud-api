const postSchema = [
  ['date', 'number'],
  ['title', 'string'],
  ['body', 'string'],
  ['id', 'string'],
];

const validate = (schema, obj) => {
  schema.forEach(([prop, type]) => {
    if (typeof obj[prop] !== type) {
      throw new Error(INVALID_SCHEMA);
    }
  });
};

export const validatePost = validate.bind(null, postSchema);
