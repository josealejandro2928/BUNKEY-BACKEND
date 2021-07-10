export const simpleValidate = (att: any[] = [], object: any) => {
  const errors = [];
  for (const field of att) {
    if (field instanceof Object) {
      if (!['object', 'number', 'string', 'boolean'].includes(field.type)) {
        throw {
          status: 400,
          message: `Bad configuration of validation the types ara only = ['object', 'number', 'string', 'boolean']`,
        };
      }
      if (field.type != typeof object[field.value]) {
        errors.push({
          message: `The field ${field.value} must be ${field.type}`,
        });
      }
      if (!(field.value in object) || object[field.value] == null) {
        errors.push({ message: `The field ${field.value} is required` });
      }
    } else {
      if (!(field in object) || object[field] == null) {
        errors.push({ message: `The field ${field} is required` });
      }
    }
  }
  return errors;
};
