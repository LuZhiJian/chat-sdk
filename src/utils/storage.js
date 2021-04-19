function isJSON(str) {
  if (typeof str === 'string') {
    try {
      const obj = JSON.parse(str);
      if (typeof obj === 'object' && obj) {
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  }
  return false;
}

const keyBase = 'imsdk_';
export const lcSet = function (key, obj) {
  const val = (obj && typeof obj === 'object') ? JSON.stringify(obj) : obj;
  localStorage.setItem(`${keyBase}${key}`, val);
};

export const lcGet = function (key) {
  const data = localStorage.getItem(`${keyBase}${key}`);
  const val = isJSON(data) ? JSON.parse(data) : data;
  return val;
};

export const lcRemove = function (key) {
  localStorage.removeItem(`${keyBase}${key}`);
};

export const ssSet = function (key, obj) {
  const val = typeof obj === 'object' ? JSON.stringify(obj) : obj;
  sessionStorage.setItem(`${keyBase}${key}`, val);
};

export const ssGet = function (key) {
  const data = sessionStorage.getItem(`${keyBase}${key}`);
  const val = isJSON(data) ? JSON.parse(data) : data;
  return val;
};

export const ssRemove = function (key) {
  sessionStorage.removeItem(`${keyBase}${key}`);
};
