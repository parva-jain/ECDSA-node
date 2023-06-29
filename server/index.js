const express = require("express");
const app = express();
const cors = require("cors");
const { secp256k1 } = require("ethereum-cryptography/secp256k1");
const hashMessage = require("./utils/hashMessage");
const port = 3042;
const { toHex } = require("ethereum-cryptography/utils");

app.use(cors());
app.use(express.json());

const balances = {
  "030681fc109594fe2d3b461d34802b7155a1f9354b006cd15d15dc1c654d71d5f9": 100,
  "03c415e95e14381206b92dc11b2dad45cbe3261e100474505f199dd0d8775e52e1": 50,
  "0286c943dd3ad8128e3d59d0b7dc6289e2748181429313a3e766ffcec69307c205": 75,
};

app.get("/balance/:address", (req, res) => {
  const { address } = req.params;
  const balance = balances[address] || 0;
  res.send({ balance });
});

app.post("/send", (req, res) => {
  const { sender, recipient, amount, signedMessage, message, privateKey } =
    req.body;

  setInitialBalance(sender);
  setInitialBalance(recipient);

  const senderPublicKey = secp256k1.getPublicKey(privateKey);
  console.log("Sender Public Key : ", senderPublicKey);
  console.log("Sender Private Key : ", privateKey);
  console.log("Sender Message : ", message);
  console.log("Signed Message : ", signedMessage[0]);

  const valid = secp256k1.verify(
    signedMessage,
    hashMessage(message),
    senderPublicKey
  );
  console.log("Is valid transaction ? : ", valid);

  if (valid) {
    if (balances[sender] < amount) {
      res.status(400).send({ message: "Not enough funds!" });
    } else {
      balances[sender] -= amount;
      balances[recipient] += amount;
      res.send({ balance: balances[sender] });
    }
  } else {
    res.send("This operation is not allowed from your private key !!");
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});

function setInitialBalance(address) {
  if (!balances[address]) {
    balances[address] = 0;
  }
}
