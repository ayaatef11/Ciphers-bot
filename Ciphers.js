//*************************Caesar Cipher************************/
function CaesarEncrypt(text, shift) {
  let result = "";

  for (let i = 0; i < text.length; i++) {
    if (/[a-zA-Z]/.test(text[i])) {
      let base = text[i] === text[i].toUpperCase() ? "A" : "a";
      let encryptedChar = String.fromCharCode(
        ((text[i].charCodeAt(0) - base.charCodeAt(0) + shift) % 26) +
          base.charCodeAt(0)
      );
      result += encryptedChar;
    } else {
      result += text[i];
    }
  }
  return result;
}

function CaesarDecrypt(text, shift) {
  return CaesarEncrypt(text, -shift);
}


/*******************Monoalphabetic Cipher*******************************/
const plain = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const cipher = "QWERTYUIOPASDFGHJKLZXCVBNM";

function monoEncrypt(text) {
  text = text.toUpperCase();
  let result = "";

  for (let char of text) {
    if (plain.includes(char)) {//search in plain
      let index = plain.indexOf(char);
      result += cipher[index];
    } else {
      result += char;
    }
  }
  return result;
}

function monoDecrypt(text) {//search in cipher
  text = text.toUpperCase();
  let result = "";
  for (let char of text) {
    if (cipher.includes(char)) {
      let index = cipher.indexOf(char);
      result += plain[index];
    } else {
      result += char;
    }
  }
  return result;
}


/***********************************Hill Cipher********************************/
// Convert character to number (A=0, B=1, ..., Z=25)
function charToNum(c) {
  return c.toUpperCase().charCodeAt(0) - 65;
}

// Convert number to character
function numToChar(n) {
  return String.fromCharCode((n % 26 + 26) % 26 + 65);
}

// Multiply matrix by vector modulo 26
function multiplyMatrix(matrix, vector) {
  let result = [];
  for (let i = 0; i < matrix.length; i++) {
    let sum = 0;
    for (let j = 0; j < vector.length; j++) {
      sum += matrix[i][j] * vector[j];
    }
    result.push((sum % 26 + 26) % 26);
  }
  return result;
}

// Compute minor of a matrix
function minor(matrix, i, j) {
  return matrix
    .filter((_, row) => row !== i)
    .map(row => row.filter((_, col) => col !== j));
}

// Determinant of a matrix modulo mod
function determinant(matrix, mod = 26) {
  const n = matrix.length;
  if (n === 1) return matrix[0][0] % mod;
  if (n === 2) return ((matrix[0][0]*matrix[1][1] - matrix[0][1]*matrix[1][0]) % mod + mod) % mod;

  let det = 0;
  for (let j = 0; j < n; j++) {
    det += ((-1) ** j) * matrix[0][j] * determinant(minor(matrix, 0, j), mod);
    det %= mod;
  }
  return (det + mod) % mod;
}

// Cofactor matrix
function cofactorMatrix(matrix, mod = 26) {
  const n = matrix.length;
  const cof = Array.from({ length: n }, () => Array(n).fill(0));
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      cof[i][j] = ((-1) ** (i + j) * determinant(minor(matrix, i, j), mod)) % mod;
      cof[i][j] = (cof[i][j] + mod) % mod;
    }
  }
  return cof;
}

// Transpose matrix
function transpose(matrix) {
  return matrix[0].map((_, col) => matrix.map(row => row[col]));
}

// Modular inverse of a matrix
function modInverseMatrix(matrix, mod = 26) {
  const det = determinant(matrix, mod);
  let detInv;
  for (let x = 1; x < mod; x++) {
    if ((det * x) % mod === 1) {
      detInv = x;
      break;
    }
  }
  if (detInv == null) throw new Error("No modular inverse exists");

  const adj = transpose(cofactorMatrix(matrix, mod));
  return adj.map(row => row.map(val => (val * detInv) % mod));
}

// Convert input string to square matrix
function inputToMatrix(input) {
  const numbers = input.split(/\s+/).map(Number);
  const n = Math.sqrt(numbers.length);
  if (!Number.isInteger(n)) throw new Error("Number of digits must form a square matrix");
  const matrix = [];
  for (let i = 0; i < n; i++) {
    matrix.push(numbers.slice(i * n, (i + 1) * n));
  }
  return matrix;
}

// Hill Cipher encryption
function hillEncrypt(text, keyInput) {
  const keyMatrix = inputToMatrix(keyInput);
  const n = keyMatrix.length;
  text = text.toUpperCase().replace(/[^A-Z]/g, "");
// debugger  
  while (text.length % n !== 0) text += "X";

  let result = "";
  for (let i = 0; i < text.length; i += n) {
    const vector = text.slice(i, i + n).split("").map(charToNum);
    const encrypted = multiplyMatrix(keyMatrix, vector);
    result += encrypted.map(numToChar).join("");
  }
  return result;
}

// Hill Cipher decryption
function hillDecrypt(cipher, keyInput) {
  const keyMatrix = inputToMatrix(keyInput);
  const inverseKey = modInverseMatrix(keyMatrix);
  const n = inverseKey.length;

  let result = "";
  for (let i = 0; i < cipher.length; i += n) {
    const vector = cipher.slice(i, i + n).split("").map(charToNum);
    const decrypted = multiplyMatrix(inverseKey, vector);
    result += decrypted.map(numToChar).join("");
  }
  return result.replace(/X(?=$|.)/g, "");
}


/***********************************Vigenère Cipher********************************/
function vigenereAutoKeyEncrypt(plainText, key) {
  plainText = plainText.toUpperCase().replace(/[^A-Z]/g, "");
  key = key.toUpperCase();
  let baseKey=key;
  while (key.length < plainText.length) {
    key += baseKey;
  }
console.log(key)
  let encrypted = "";

  for (let i = 0; i < plainText.length; i++) {
    const p = plainText[i].charCodeAt(0) - 65;
    const k = key[i].charCodeAt(0) - 65;

    const c = (p + k) % 26;

    encrypted += String.fromCharCode(c + 65);
  }

  return encrypted;
}

function vigenereAutoKeyDecrypt(cipherText, key) {
  cipherText = cipherText.toUpperCase().replace(/[^A-Z]/g, "");
  key = key.toUpperCase();
  let baseKey=key;
  while (key.length < cipherText.length) {
    key += baseKey;
  }
  console.log(key)
  let decrypted = "";

  for (let i = 0; i < cipherText.length; i++) {
    const c = cipherText[i].charCodeAt(0) - 65;
    const k = key[i].charCodeAt(0) - 65;
    const p = (c - k + 26) % 26;
    const plainChar = String.fromCharCode(p + 65);
    decrypted += plainChar;
    key += plainChar;
  }

  return decrypted;
}



/***********************************Playfair Cipher********************************/


const onlyLetters = (s) => s.replace(/[^A-Za-z]/g, "");
const upper = (s) => s.toUpperCase();

function buildPlayfairMatrix(key) {
  key = upper(onlyLetters(key)).replace(/J/g, "I");
  const used = new Set();
  const table = [];

  for (let ch of key) {
    if (!used.has(ch)) {
      used.add(ch);
      table.push(ch);
    }
  }
key = key.replace(/J/g, "I");//we treat i and j as the same
  for (let ch of "ABCDEFGHIKLMNOPQRSTUVWXYZ") { 
    if (!used.has(ch)) table.push(ch);
  }

  const mat = Array.from({ length: 5 }, (_, r) =>
    table.slice(r * 5, r * 5 + 5)
  );
 

  const map = {};
  mat.forEach((row, r) =>
    row.forEach((ch, c) => (map[ch] = { r, c }))
  );

  return { mat, map };
}
 
function playfairPrepare(text) {//we need it to check if we need to push x or not
  text = upper(onlyLetters(text)).replace(/J/g, "I");
  let digrams = [];
  let i = 0;
  while (i < text.length) {
    let a = text[i];
    let b = text[i + 1];

    if (!b || a === b) {
      digrams.push(a + "X");
      i++;
    } else {
      digrams.push(a + b);
      i += 2;
    }
  }
  return digrams;
}

function playfairEncrypt(plaintext, key) {
  const { mat, map } = buildPlayfairMatrix(key);
  
  const digrams = playfairPrepare(plaintext);
  let out = "";

  for (const [x, y] of digrams.map(d => d.split(""))) {//every pair of characters is split into x and y
    //we not loop over the plain text but in the diagram as it contains the x values
    const A = map[x], B = map[y];//get the location of x and y 
    if (A.r === B.r) {//if same row
      out += mat[A.r][(A.c + 1) % 5];
      out += mat[B.r][(B.c + 1) % 5];
    } else if (A.c === B.c) {//if same column
      out += mat[(A.r + 1) % 5][A.c];
      out += mat[(B.r + 1) % 5][B.c];
    } else {//either then create a rectangle
      out += mat[A.r][B.c] ;
      out+= mat[B.r][A.c];
    }
  }
  return out;
}

function playfairDecrypt(ciphertext, key) {
  const { mat, map } = buildPlayfairMatrix(key);
  ciphertext = upper(onlyLetters(ciphertext));

  if (ciphertext.length % 2 !== 0)
    throw new Error("Playfair ciphertext length must be even");

  let out = "";

  for (let i = 0; i < ciphertext.length; i += 2) {//no need to generate the diagrams
    const A = map[ciphertext[i]];
    const B = map[ciphertext[i + 1]];

    if (A.r === B.r) {
      out += mat[A.r][(A.c + 4) % 5];//take on the right instead
      out += mat[B.r][(B.c + 4) % 5];
    } else if (A.c === B.c) {
      out += mat[(A.r + 4) % 5][A.c];//take on the up instead
      out += mat[(B.r + 4) % 5][B.c];
    } else {
      out += mat[A.r][B.c] ;//same as encryption
      out+= mat[B.r][A.c];
    }
  }

  return out.replace(/X(?=$|.)/g, ""); 
}


 

/*******************************permutation Cipher****************************************/
function normalizeKey(key) {
    if (Array.isArray(key)) return key.map(Number);
    return key.trim().split(/\s+/).map(Number);
}


function encryptPermutation(text, key) {
    key = normalizeKey(key);
    const size = key.length;
    text = text.replace(/ /g, "").toLowerCase();

    while (text.length % size !== 0) text += "x";

    let encrypted = "";

    for (let i = 0; i < text.length; i += size) {
        const block = text.slice(i, i + size);
        let resultBlock = Array(size);

        for (let j = 0; j < size; j++) {
            resultBlock[j] = block[key[j] - 1];
        }

        encrypted += resultBlock.join("");
    }

    return encrypted.toUpperCase();
}


function decryptPermutation(cipher, key) {
    key = normalizeKey(key);
    const size = key.length;

    cipher = cipher.replace(/ /g, "").toLowerCase();

    let decrypted = "";

    for (let i = 0; i < cipher.length; i += size) {
        const block = cipher.slice(i, i + size);
        let resultBlock = Array(size);

        for (let j = 0; j < size; j++) {
            resultBlock[key[j] - 1] = block[j];
        }

        decrypted += resultBlock.join("");
    }

    return  decrypted.replace(/x+$/i, "");;
}


/***********************************rail Fence Cipher********************************/
function railFenceEncrypt(text, depth) {
  depth = Number(depth);
  if (depth < 2) throw new Error("Depth must be ≥ 2");

  text = text.replace(/\s/g, "").toLowerCase();//no new lines or spaces
  console.log(text)
  const rails = Array.from({ length: depth }, () => "");

  let row = 0, dir = -1;
  for (let ch of text) {
    rails[row] += ch;
    if (row === 0 || row === depth - 1) dir *= -1;
    row += dir;
  }
  return rails.join("").toUpperCase();
}

function railFenceDecrypt(cipher, depth) {
  depth = Number(depth);
  if (depth < 2) throw new Error("Depth must be ≥ 2");
  cipher = cipher.toLowerCase();
  const len = cipher.length;
  const rail = Array.from({ length: depth }, () => Array(len).fill(null));

  let row = 0, dir = -1;
  for (let i = 0; i < len; i++) {
    rail[row][i] = "*";
    if (row === 0 || row === depth - 1) dir *= -1;
    row += dir;
  }
 

  let idx = 0;
  for (let r = 0; r < depth; r++) {
    for (let c = 0; c < len; c++) {
      if (rail[r][c] === "*") rail[r][c] = cipher[idx++];
    }
  }

  let out = "";
  row = 0; dir = -1;
  for (let i = 0; i < len; i++) {
    out += rail[row][i];
    if (row === 0 || row === depth - 1) dir *= -1;
    row += dir;
  }
  return out;
}


/***********************************Des Cipher********************************/
const IP = [
  58, 50, 42, 34, 26, 18, 10, 2, 60, 52, 44, 36, 28, 20, 12, 4, 62, 54, 46, 38,
  30, 22, 14, 6, 64, 56, 48, 40, 32, 24, 16, 8, 57, 49, 41, 33, 25, 17, 9, 1,
  59, 51, 43, 35, 27, 19, 11, 3, 61, 53, 45, 37, 29, 21, 13, 5, 63, 55, 47, 39,
  31, 23, 15, 7,
];

const IP_INV = [
  40, 8, 48, 16, 56, 24, 64, 32, 39, 7, 47, 15, 55, 23, 63, 31, 38, 6, 46, 14,
  54, 22, 62, 30, 37, 5, 45, 13, 53, 21, 61, 29, 36, 4, 44, 12, 52, 20, 60, 28,
  35, 3, 43, 11, 51, 19, 59, 27, 34, 2, 42, 10, 50, 18, 58, 26, 33, 1, 41, 9,
  49, 17, 57, 25,
];

const EXPANSION = [
  32, 1, 2, 3, 4, 5, 4, 5, 6, 7, 8, 9, 8, 9, 10, 11, 12, 13, 12, 13, 14, 15, 16,
  17, 16, 17, 18, 19, 20, 21, 20, 21, 22, 23, 24, 25, 24, 25, 26, 27, 28, 29,
  28, 29, 30, 31, 32, 1,
];

const P = [
  16, 7, 20, 21, 29, 12, 28, 17, 1, 15, 23, 26, 5, 18, 31, 10, 2, 8, 24, 14, 32,
  27, 3, 9, 19, 13, 30, 6, 22, 11, 4, 25,
];

const S_BOXES = [
  [
    [14, 4, 13, 1, 2, 15, 11, 8, 3, 10, 6, 12, 5, 9, 0, 7],
    [0, 15, 7, 4, 14, 2, 13, 1, 10, 6, 12, 11, 9, 5, 3, 8],
    [4, 1, 14, 8, 13, 6, 2, 11, 15, 12, 9, 7, 3, 10, 5, 0],
    [15, 12, 8, 2, 4, 9, 1, 7, 5, 11, 3, 14, 10, 0, 6, 13],
  ],
  [
    [15, 1, 8, 14, 6, 11, 3, 4, 9, 7, 2, 13, 12, 0, 5, 10],
    [3, 13, 4, 7, 15, 2, 8, 14, 12, 0, 1, 10, 6, 9, 11, 5],
    [0, 14, 7, 11, 10, 4, 13, 1, 5, 8, 12, 6, 9, 3, 2, 15],
    [13, 8, 10, 1, 3, 15, 4, 2, 11, 6, 7, 12, 0, 5, 14, 9],
  ],
  [
    [10, 0, 9, 14, 6, 3, 15, 5, 1, 13, 12, 7, 11, 4, 2, 8],
    [13, 7, 0, 9, 3, 4, 6, 10, 2, 8, 5, 14, 12, 11, 15, 1],
    [13, 6, 4, 9, 8, 15, 3, 0, 11, 1, 2, 12, 5, 10, 14, 7],
    [1, 10, 13, 0, 6, 9, 8, 7, 4, 15, 14, 3, 11, 5, 2, 12],
  ],
  [
    [7, 13, 14, 3, 0, 6, 9, 10, 1, 2, 8, 5, 11, 12, 4, 15],
    [13, 8, 11, 5, 6, 15, 0, 3, 4, 7, 2, 12, 1, 10, 14, 9],
    [10, 6, 9, 0, 12, 11, 7, 13, 15, 1, 3, 14, 5, 2, 8, 4],
    [3, 15, 0, 6, 10, 1, 13, 8, 9, 4, 5, 11, 12, 7, 2, 14],
  ],
  [
    [2, 12, 4, 1, 7, 10, 11, 6, 8, 5, 3, 15, 13, 0, 14, 9],
    [14, 11, 2, 12, 4, 7, 13, 1, 5, 0, 15, 10, 3, 9, 8, 6],
    [4, 2, 1, 11, 10, 13, 7, 8, 15, 9, 12, 5, 6, 3, 0, 14],
    [11, 8, 12, 7, 1, 14, 2, 13, 6, 15, 0, 9, 10, 4, 5, 3],
  ],
  [
    [12, 1, 10, 15, 9, 2, 6, 8, 0, 13, 3, 4, 14, 7, 5, 11],
    [10, 15, 4, 2, 7, 12, 9, 5, 6, 1, 13, 14, 0, 11, 3, 8],
    [9, 14, 15, 5, 2, 8, 12, 3, 7, 0, 4, 10, 1, 13, 11, 6],
    [4, 3, 2, 12, 9, 5, 15, 10, 11, 14, 1, 7, 6, 0, 8, 13],
  ],
  [
    [4, 11, 2, 14, 15, 0, 8, 13, 3, 12, 9, 7, 5, 10, 6, 1],
    [13, 0, 11, 7, 4, 9, 1, 10, 14, 3, 5, 12, 2, 15, 8, 6],
    [1, 4, 11, 13, 12, 3, 7, 14, 10, 15, 6, 8, 0, 5, 9, 2],
    [6, 11, 13, 8, 1, 4, 10, 7, 9, 5, 0, 15, 14, 2, 3, 12],
  ],
  [
    [13, 2, 8, 4, 6, 15, 11, 1, 10, 9, 3, 14, 5, 0, 12, 7],
    [1, 15, 13, 8, 10, 3, 7, 4, 12, 5, 6, 11, 0, 14, 9, 2],
    [7, 11, 4, 1, 9, 12, 14, 2, 0, 6, 10, 13, 15, 3, 5, 8],
    [2, 1, 14, 7, 4, 10, 8, 13, 15, 12, 9, 0, 3, 5, 6, 11],
  ],
];

const PC1 = [
  57, 49, 41, 33, 25, 17, 9, 1, 58, 50, 42, 34, 26, 18, 10, 2, 59, 51, 43, 35,
  27, 19, 11, 3, 60, 52, 44, 36, 63, 55, 47, 39, 31, 23, 15, 7, 62, 54, 46, 38,
  30, 22, 14, 6, 61, 53, 45, 37, 29, 21, 13, 5, 28, 20, 12, 4,
];

const PC2 = [
  14, 17, 11, 24, 1, 5, 3, 28, 15, 6, 21, 10, 23, 19, 12, 4, 26, 8, 16, 7, 27,
  20, 13, 2, 41, 52, 31, 37, 47, 55, 30, 40, 51, 45, 33, 48, 44, 49, 39, 56, 34,
  53, 46, 42, 50, 36, 29, 32,
];

const SHIFTS = [1, 1, 2, 2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 2, 2, 1];

function permute(input, table) {
  return table.map((pos) => input[pos - 1]).join("");
}

function xor(a, b) {
  let res = [];
  for (let i = 0; i < a.length; i++) res.push(a[i] ^ b[i]);
  return res.join("");
}

function leftRotate(str, n) {
  return str.slice(n) + str.slice(0, n);
}

function sBoxSub(input48) {
  let result = "";
  for (let i = 0; i < 48; i += 6) {
    let block = input48.slice(i, i + 6);
    let row = parseInt(block[0] + block[5], 2);
    let col = parseInt(block.slice(1, 5), 2);
    let sVal = S_BOXES[i / 6][row][col].toString(2).padStart(4, "0");
    result += sVal;
  }
  return result;
}

function strToBitString(str) {
  return str
    .split("")
    .map((c) => c.charCodeAt(0).toString(2).padStart(8, "0"))
    .join("");
}

function bitStringToStr(bits) {
  let out = "";
  for (let i = 0; i < bits.length; i += 8) {
    out += String.fromCharCode(parseInt(bits.slice(i, i + 8), 2));
  }
  return out;
}

function generateRoundKeys(key8chars) {
  let keyBits = strToBitString(key8chars);
  let perm56 = permute(keyBits, PC1);
  let C = perm56.slice(0, 28);
  let D = perm56.slice(28, 56);
  let roundKeys = [];
  for (let i = 0; i < 16; i++) {
    C = leftRotate(C, SHIFTS[i]);
    D = leftRotate(D, SHIFTS[i]);
    let combined = C + D;
    let roundKey48 = permute(combined, PC2);
    roundKeys.push(roundKey48);
  }
  return roundKeys;
}

function feistelFunction(right32, roundKey48) {
  let expanded = permute(right32, EXPANSION);
  let x = xor(expanded, roundKey48);
  let sOut = sBoxSub(x);
  let permuted = permute(sOut, P);
  return permuted;
}

function processBlock(block8Bytes, roundKeys, encrypt = true) {
  let blockBits = strToBitString(block8Bytes);
  let permuted = permute(blockBits, IP);
  let L = permuted.slice(0, 32);
  let R = permuted.slice(32, 64);

  let keys = encrypt ? roundKeys : [...roundKeys].reverse();

  for (let i = 0; i < 16; i++) {
    let fOut = feistelFunction(R, keys[i]);
    let newR = xor(L, fOut);
    L = R;
    R = newR;
  }

  let preoutput = R + L;
  let finalBits = permute(preoutput, IP_INV);
  return bitStringToStr(finalBits);
}

function pkcs5Pad(dataStr) {
  let padLen = 8 - (dataStr.length % 8);
  if (padLen === 0) padLen = 8;
  let padChar = String.fromCharCode(padLen);
  return dataStr + padChar.repeat(padLen);
}

function pkcs5Unpad(dataStr) {
  if (dataStr.length === 0) return dataStr;
  let lastChar = dataStr.charCodeAt(dataStr.length - 1);
  if (lastChar < 1 || lastChar > 8) return dataStr;
  return dataStr.slice(0, dataStr.length - lastChar);
}

function DES_Process(dataStr, key8chars, encrypt = true) {
  if (key8chars.length !== 8) throw new Error("Key must be 8 characters");
  let roundKeys = generateRoundKeys(key8chars);
  let input = dataStr;
  if (encrypt) {
    input = pkcs5Pad(input);
  } else {
    if (input.length % 8 !== 0) {
      throw new Error("Ciphertext length must be multiple of 8 bytes");
    }
  }

  let output = "";
  for (let i = 0; i < input.length; i += 8) {
    let block = input.slice(i, i + 8);
    output += processBlock(block, roundKeys, encrypt);
  }

  if (!encrypt) {
    output = pkcs5Unpad(output);
  }
  return output;
}

function DES_Encrypt(text, key) {
  return DES_Process(text, key, true);
}

function DES_Decrypt(ciphertext, key) {
  return DES_Process(ciphertext, key, false);
}

function doDESEncrypt() {
  try {
    let text = document.getElementById("inputText").value;
    let key = document.getElementById("desKey").value;
    if (key.length !== 8) {
      alert("Key must be exactly 8 characters");
      return;
    }
    let encrypted = DES_Encrypt(text, key);
    let b64 = btoa(encrypted);
    document.getElementById("result").innerText = b64;
  } catch (e) {
    alert("Encryption error: " + e.message);
  }
}

function doDESDecrypt() {
  try {
    let b64 = document.getElementById("inputText").value;
    let key = document.getElementById("desKey").value;
    if (key.length !== 8) {
      alert("Key must be exactly 8 characters");
      return;
    }
    let ciphertext = atob(b64);
    let decrypted = DES_Decrypt(ciphertext, key);
    document.getElementById("result").innerText = decrypted;
  } catch (e) {
    alert("Decryption error: " + e.message);
  }
}

/***********************************One-Time Pad Cipher********************************/

function otpEncrypt(text, key) {
  if (text.length !== key.length) {
    alert("Key length must match message length for OTP!");
    return "";
  }
  let result = "";
  for (let i = 0; i < text.length; i++) {
    result += String.fromCharCode(text.charCodeAt(i) ^ key.charCodeAt(i));
  }
  return result;
}

function otpDecrypt(text, key) {
  return otpEncrypt(text, key); // same operation
}

function doOneTimePadEncrypt() {
  let text = document.getElementById("inputText").value;
  let key = document.getElementById("desKey").value;
  if (key.length !== text.length) {
    alert("Key must be same length as message!");
    return;
  }
  let encrypted = otpEncrypt(text, key);
  let b64 = btoa(encrypted);
  document.getElementById("result").innerText = "Encrypted: " + b64;
}

function doOneTimePadDecrypt() {
  let b64 = document.getElementById("inputText").value;
  let key = document.getElementById("desKey").value;
  let ciphertext = atob(b64);
  let decrypted = otpDecrypt(ciphertext, key);
  document.getElementById("result").innerText = "Decrypted: " + decrypted;
}

/***********************************Row Transposition  Cipher********************************/

function rowTranspositionEncrypt(plaintext, key) {
  let n = key.length;
  let rows = Math.ceil(plaintext.length / n);
  let padded = plaintext.padEnd(rows * n, "_");
  let matrix = [];

  for (let i = 0; i < rows; i++) {
    matrix.push(padded.slice(i * n, (i + 1) * n).split(""));
  }

  let keyOrder = key
    .split("")
    .map((k, i) => [k, i])
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map((x) => x[1]);

  let ciphertext = "";
  for (let col of keyOrder) {
    for (let row of matrix) {
      ciphertext += row[col];
    }
  }
  return ciphertext;
}

function rowTranspositionDecrypt(ciphertext, key) {
  let n = key.length;
  let rows = Math.ceil(ciphertext.length / n);
  let keyOrder = key
    .split("")
    .map((k, i) => [k, i])
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map((x) => x[1]);

  let matrix = Array.from({ length: rows }, () => Array(n));
  let index = 0;
  for (let col of keyOrder) {
    for (let row = 0; row < rows; row++) {
      matrix[row][col] = ciphertext[index++];
    }
  }

  return matrix
    .map((r) => r.join(""))
    .join("")
    .replace(/_+$/, "");
}

function doRowTranspositionEncrypt() {
  let text = document.getElementById("inputText").value;
  let key = document.getElementById("desKey").value;
  let encrypted = rowTranspositionEncrypt(text, key);
  document.getElementById("result").innerText = "Encrypted: " + encrypted;
}

function doRowTranspositionDecrypt() {
  let text = document.getElementById("inputText").value;
  let key = document.getElementById("desKey").value;
  let decrypted = rowTranspositionDecrypt(text, key);
  document.getElementById("result").innerText = "Decrypted: " + decrypted;
}

/***********************************AES Cipher************************************************/
// S-box
const sBox = [
  0x63, 0x7c, 0x77, 0x7b, 0xf2, 0x6b, 0x6f, 0xc5, 0x30, 0x01, 0x67, 0x2b, 0xfe,
  0xd7, 0xab, 0x76, 0xca, 0x82, 0xc9, 0x7d, 0xfa, 0x59, 0x47, 0xf0, 0xad, 0xd4,
  0xa2, 0xaf, 0x9c, 0xa4, 0x72, 0xc0, 0xb7, 0xfd, 0x93, 0x26, 0x36, 0x3f, 0xf7,
  0xcc, 0x34, 0xa5, 0xe5, 0xf1, 0x71, 0xd8, 0x31, 0x15, 0x04, 0xc7, 0x23, 0xc3,
  0x18, 0x96, 0x05, 0x9a, 0x07, 0x12, 0x80, 0xe2, 0xeb, 0x27, 0xb2, 0x75, 0x09,
  0x83, 0x2c, 0x1a, 0x1b, 0x6e, 0x5a, 0xa0, 0x52, 0x3b, 0xd6, 0xb3, 0x29, 0xe3,
  0x2f, 0x84, 0x53, 0xd1, 0x00, 0xed, 0x20, 0xfc, 0xb1, 0x5b, 0x6a, 0xcb, 0xbe,
  0x39, 0x4a, 0x4c, 0x58, 0xcf, 0xd0, 0xef, 0xaa, 0xfb, 0x43, 0x4d, 0x33, 0x85,
  0x45, 0xf9, 0x02, 0x7f, 0x50, 0x3c, 0x9f, 0xa8, 0x51, 0xa3, 0x40, 0x8f, 0x92,
  0x9d, 0x38, 0xf5, 0xbc, 0xb6, 0xda, 0x21, 0x10, 0xff, 0xf3, 0xd2, 0xcd, 0x0c,
  0x13, 0xec, 0x5f, 0x97, 0x44, 0x17, 0xc4, 0xa7, 0x7e, 0x3d, 0x64, 0x5d, 0x19,
  0x73, 0x60, 0x81, 0x4f, 0xdc, 0x22, 0x2a, 0x90, 0x88, 0x46, 0xee, 0xb8, 0x14,
  0xde, 0x5e, 0x0b, 0xdb, 0xe0, 0x32, 0x3a, 0x0a, 0x49, 0x06, 0x24, 0x5c, 0xc2,
  0xd3, 0xac, 0x62, 0x91, 0x95, 0xe4, 0x79, 0xe7, 0xc8, 0x37, 0x6d, 0x8d, 0xd5,
  0x4e, 0xa9, 0x6c, 0x56, 0xf4, 0xea, 0x65, 0x7a, 0xae, 0x08, 0xba, 0x78, 0x25,
  0x2e, 0x1c, 0xa6, 0xb4, 0xc6, 0xe8, 0xdd, 0x74, 0x1f, 0x4b, 0xbd, 0x8b, 0x8a,
  0x70, 0x3e, 0xb5, 0x66, 0x48, 0x03, 0xf6, 0x0e, 0x61, 0x35, 0x57, 0xb9, 0x86,
  0xc1, 0x1d, 0x9e, 0xe1, 0xf8, 0x98, 0x11, 0x69, 0xd9, 0x8e, 0x94, 0x9b, 0x1e,
  0x87, 0xe9, 0xce, 0x55, 0x28, 0xdf, 0x8c, 0xa1, 0x89, 0x0d, 0xbf, 0xe6, 0x42,
  0x68, 0x41, 0x99, 0x2d, 0x0f, 0xb0, 0x54, 0xbb, 0x16,
];

// AES parameters
const Nb = 4; // block size in 32-bit words
const Nk = 4; // key length in 32-bit words (AES-128)
const Nr = 10; // number of rounds

// Helper functions
function subBytes(state) {
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      state[r][c] = sBox[state[r][c]];
    }
  }
  return state;
}

function shiftRows(state) {
  for (let r = 1; r < 4; r++) {
    state[r] = state[r].slice(r).concat(state[r].slice(0, r));
  }
  return state;
}

function xtime(a) {
  return ((a << 1) ^ (((a >> 7) & 1) * 0x1b)) & 0xff;
}

function mixColumns(state) {
  for (let c = 0; c < 4; c++) {
    let a = [];
    let b = [];
    for (let i = 0; i < 4; i++) {
      a[i] = state[i][c];
      b[i] = xtime(state[i][c]);
    }
    state[0][c] = b[0] ^ a[3] ^ a[2] ^ b[1] ^ a[1];
    state[1][c] = b[1] ^ a[0] ^ a[3] ^ b[2] ^ a[2];
    state[2][c] = b[2] ^ a[1] ^ a[0] ^ b[3] ^ a[3];
    state[3][c] = b[3] ^ a[2] ^ a[1] ^ b[0] ^ a[0];
  }
  return state;
}

function addRoundKey(state, w, round) {
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      state[r][c] ^= w[round * 4 + c][r];
    }
  }
  return state;
}

// Key expansion
const Rcon = [0x01, 0x02, 0x04, 0x08, 0x10, 0x20, 0x40, 0x80, 0x1b, 0x36];
function subWord(word) {
  return word.map((b) => sBox[b]);
}
function rotWord(word) {
  return word.slice(1).concat(word.slice(0, 1));
}

function keyExpansion(key) {
  let w = [];
  for (let i = 0; i < Nk; i++) {
    w[i] = key.slice(4 * i, 4 * i + 4);
  }
  for (let i = Nk; i < Nb * (Nr + 1); i++) {
    let temp = w[i - 1].slice();
    if (i % Nk === 0) {
      temp = subWord(rotWord(temp));
      temp[0] ^= Rcon[i / Nk - 1];
    }
    w[i] = [];
    for (let j = 0; j < 4; j++) {
      w[i][j] = w[i - Nk][j] ^ temp[j];
    }
  }
  return w;
}

// Convert 16-byte array to 4x4 matrix
function toMatrix(input) {
  let m = [[], [], [], []];
  for (let i = 0; i < 16; i++) {
    m[i % 4].push(input[i]);
  }
  return m;
}

// Convert matrix to array
function fromMatrix(m) {
  let arr = [];
  for (let c = 0; c < 4; c++) {
    for (let r = 0; r < 4; r++) {
      arr.push(m[r][c]);
    }
  }
  return arr;
}

// AES Encrypt one block (16 bytes)
function aesEncryptBlock(input, keyBytes) {
  let state = toMatrix(input);
  let w = keyExpansion(keyBytes);
  state = addRoundKey(state, w, 0);
  for (let round = 1; round < Nr; round++) {
    state = subBytes(state);
    state = shiftRows(state);
    state = mixColumns(state);
    state = addRoundKey(state, w, round);
  }
  state = subBytes(state);
  state = shiftRows(state);
  state = addRoundKey(state, w, Nr);
  return fromMatrix(state);
}

// Padding (PKCS7)
function pad(input) {
  let padLen = 16 - (input.length % 16);
  return input.concat(Array(padLen).fill(padLen));
}

// Encrypt multiple blocks
function aesEncrypt(inputText, keyText) {
  let inputBytes = Array.from(inputText).map((c) => c.charCodeAt(0));
  let keyBytes = Array.from(keyText).map((c) => c.charCodeAt(0));
  if (keyBytes.length !== 16) throw "Key must be 16 bytes!";
  inputBytes = pad(inputBytes);
  let output = [];
  for (let i = 0; i < inputBytes.length; i += 16) {
    let block = inputBytes.slice(i, i + 16);
    output = output.concat(aesEncryptBlock(block, keyBytes));
  }
  return btoa(String.fromCharCode(...output));
}
// Inverse S-box
const invSBox = [
  0x52, 0x09, 0x6a, 0xd5, 0x30, 0x36, 0xa5, 0x38, 0xbf, 0x40, 0xa3, 0x9e, 0x81,
  0xf3, 0xd7, 0xfb, 0x7c, 0xe3, 0x39, 0x82, 0x9b, 0x2f, 0xff, 0x87, 0x34, 0x8e,
  0x43, 0x44, 0xc4, 0xde, 0xe9, 0xcb, 0x54, 0x7b, 0x94, 0x32, 0xa6, 0xc2, 0x23,
  0x3d, 0xee, 0x4c, 0x95, 0x0b, 0x42, 0xfa, 0xc3, 0x4e, 0x08, 0x2e, 0xa1, 0x66,
  0x28, 0xd9, 0x24, 0xb2, 0x76, 0x5b, 0xa2, 0x49, 0x6d, 0x8b, 0xd1, 0x25, 0x72,
  0xf8, 0xf6, 0x64, 0x86, 0x68, 0x98, 0x16, 0xd4, 0xa4, 0x5c, 0xcc, 0x5d, 0x65,
  0xb6, 0x92, 0x6c, 0x70, 0x48, 0x50, 0xfd, 0xed, 0xb9, 0xda, 0x5e, 0x15, 0x46,
  0x57, 0xa7, 0x8d, 0x9d, 0x84, 0x90, 0xd8, 0xab, 0x00, 0x8c, 0xbc, 0xd3, 0x0a,
  0xf7, 0xe4, 0x58, 0x05, 0xb8, 0xb3, 0x45, 0x06, 0xd0, 0x2c, 0x1e, 0x8f, 0xca,
  0x3f, 0x0f, 0x02, 0xc1, 0xaf, 0xbd, 0x03, 0x01, 0x13, 0x8a, 0x6b, 0x3a, 0x91,
  0x11, 0x41, 0x4f, 0x67, 0xdc, 0xea, 0x97, 0xf2, 0xcf, 0xce, 0xf0, 0xb4, 0xe6,
  0x73, 0x96, 0xac, 0x74, 0x22, 0xe7, 0xad, 0x35, 0x85, 0xe2, 0xf9, 0x37, 0xe8,
  0x1c, 0x75, 0xdf, 0x6e, 0x47, 0xf1, 0x1a, 0x71, 0x1d, 0x29, 0xc5, 0x89, 0x6f,
  0xb7, 0x62, 0x0e, 0xaa, 0x18, 0xbe, 0x1b, 0xfc, 0x56, 0x3e, 0x4b, 0xc6, 0xd2,
  0x79, 0x20, 0x9a, 0xdb, 0xc0, 0xfe, 0x78, 0xcd, 0x5a, 0xf4, 0x1f, 0xdd, 0xa8,
  0x33, 0x88, 0x07, 0xc7, 0x31, 0xb1, 0x12, 0x10, 0x59, 0x27, 0x80, 0xec, 0x5f,
  0x60, 0x51, 0x7f, 0xa9, 0x19, 0xb5, 0x4a, 0x0d, 0x2d, 0xe5, 0x7a, 0x9f, 0x93,
  0xc9, 0x9c, 0xef, 0xa0, 0xe0, 0x3b, 0x4d, 0xae, 0x2a, 0xf5, 0xb0, 0xc8, 0xeb,
  0xbb, 0x3c, 0x83, 0x53, 0x99, 0x61, 0x17, 0x2b, 0x04, 0x7e, 0xba, 0x77, 0xd6,
  0x26, 0xe1, 0x69, 0x14, 0x63, 0x55, 0x21, 0x0c, 0x7d,
];

// Inverse ShiftRows
function invShiftRows(state) {
  for (let r = 1; r < 4; r++) {
    state[r] = state[r].slice(4 - r).concat(state[r].slice(0, 4 - r));
  }
  return state;
}

// Inverse SubBytes
function invSubBytes(state) {
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      state[r][c] = invSBox[state[r][c]];
    }
  }
  return state;
}

// Inverse MixColumns
function invMixColumns(state) {
  for (let c = 0; c < 4; c++) {
    let a = [];
    for (let i = 0; i < 4; i++) a[i] = state[i][c];

    state[0][c] =
      multiply(a[0], 0x0e) ^
      multiply(a[1], 0x0b) ^
      multiply(a[2], 0x0d) ^
      multiply(a[3], 0x09);
    state[1][c] =
      multiply(a[0], 0x09) ^
      multiply(a[1], 0x0e) ^
      multiply(a[2], 0x0b) ^
      multiply(a[3], 0x0d);
    state[2][c] =
      multiply(a[0], 0x0d) ^
      multiply(a[1], 0x09) ^
      multiply(a[2], 0x0e) ^
      multiply(a[3], 0x0b);
    state[3][c] =
      multiply(a[0], 0x0b) ^
      multiply(a[1], 0x0d) ^
      multiply(a[2], 0x09) ^
      multiply(a[3], 0x0e);
  }
  return state;
}

// GF(2^8) multiplication
function multiply(a, b) {
  let res = 0;
  for (let i = 0; i < 8; i++) {
    if (b & 1) res ^= a;
    let hiBitSet = a & 0x80;
    a = (a << 1) & 0xff;
    if (hiBitSet) a ^= 0x1b;
    b >>= 1;
  }
  return res;
}

// AES Decrypt one block
function aesDecryptBlock(input, keyBytes) {
  let state = toMatrix(input);
  let w = keyExpansion(keyBytes);
  state = addRoundKey(state, w, Nr);
  for (let round = Nr - 1; round >= 1; round--) {
    state = invShiftRows(state);
    state = invSubBytes(state);
    state = addRoundKey(state, w, round);
    state = invMixColumns(state);
  }
  state = invShiftRows(state);
  state = invSubBytes(state);
  state = addRoundKey(state, w, 0);
  return fromMatrix(state);
}

// Remove PKCS7 padding
function unpad(input) {
  let padLen = input[input.length - 1];
  return input.slice(0, input.length - padLen);
}

// AES Decrypt multiple blocks
function aesDecrypt(cipherTextBase64, keyText) {
  let inputStr = atob(cipherTextBase64);
  let inputBytes = Array.from(inputStr).map((c) => c.charCodeAt(0));
  let keyBytes = Array.from(keyText).map((c) => c.charCodeAt(0));
  if (keyBytes.length !== 16) throw "Key must be 16 bytes!";
  let output = [];
  for (let i = 0; i < inputBytes.length; i += 16) {
    let block = inputBytes.slice(i, i + 16);
    output = output.concat(aesDecryptBlock(block, keyBytes));
  }
  output = unpad(output);
  return String.fromCharCode(...output);
}

function doAESEncrypt() {
  try {
    let text = document.getElementById("inputText").value;
    let key = document.getElementById("desKey").value;
    if (key.length !== 16) {
      alert("AES Key must be 16 chars!");
      return;
    }
    let encrypted = aesEncrypt(text, key); // Your existing AES encrypt function
    let b64 = btoa(String.fromCharCode(...encrypted));
    document.getElementById("result").innerText = b64;
  } catch (e) {
    alert("AES Encryption Error: " + e.message);
  }
}

function doAESDecrypt() {
  try {
    let b64 = document.getElementById("inputText").value;
    let key = document.getElementById("desKey").value;
    if (key.length !== 16) {
      alert("AES Key must be 16 chars!");
      return;
    }
    let decrypted = aesDecrypt(b64, keyExpansion(key)); // keyExpansion generates round keys
    document.getElementById("result").innerText = decrypted;
  } catch (e) {
    alert("AES Decryption Error: " + e.message);
  }
}
