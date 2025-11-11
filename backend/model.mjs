import ort from 'onnxruntime-node';
import fs from 'fs';
import path from 'path';


const MODEL_PATH = path.resolve(__dirname, "model", "model.onnx");
; // model file path relative to backend
let session = null;


export async function initModel(){
if (session) return session;
if (!fs.existsSync(MODEL_PATH)) throw new Error(`ONNX model not found at ${MODEL_PATH}`);
session = await ort.InferenceSession.create(MODEL_PATH, { executionProviders: ['cpu'] });
return session;
}


export async function predictFromTensor(imageTensor, shape, labels = ['no_armyworm','armyworm']){
const sess = await initModel();
const inputNames = sess.inputNames || (sess.inputMetadata && Object.keys(sess.inputMetadata));
const inputName = (Array.isArray(inputNames) && inputNames[0]) || 'input';


const tensor = new ort.Tensor('float32', imageTensor, shape);
const feeds = {};
feeds[inputName] = tensor;


const output = await sess.run(feeds);
const outputNames = sess.outputNames || (sess.outputMetadata && Object.keys(sess.outputMetadata));
const outName = (Array.isArray(outputNames) && outputNames[0]) || Object.keys(output)[0];
const result = output[outName].data;


let scores = Array.from(result);
if (scores.length === 1) {
const prob = 1 / (1 + Math.exp(-scores[0]));
scores = [1 - prob, prob];
} else if (scores.length === 2) {
const max = Math.max(...scores);
const exps = scores.map(s => Math.exp(s - max));
const sum = exps.reduce((a,b) => a+b, 0);
scores = exps.map(e => e / sum);
} else {
const max = Math.max(...scores);
const exps = scores.map(s=>Math.exp(s - max));
const sum = exps.reduce((a,b)=>a+b,0);
scores = exps.map(e=>e/sum);
}


const labelIndex = scores[1] >= scores[0] ? 1 : 0;
return {
labelIndex,
labelName: labels[labelIndex],
confidence: scores[labelIndex]
};
}