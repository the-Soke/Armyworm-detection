# 🐛 Armyworm Detector

A web application that uses a **computer vision ONNX model** to detect armyworms on crop or leaf images. Upload an image, and the site will tell you whether armyworms are present, along with a fun alert message.  

The app includes:  

- **Backend**: Node.js + Express + ONNX Runtime  
- **Frontend**: HTML, CSS, JavaScript  
- **Image preprocessing** for ONNX models  
- **Dynamic messages** based on detection  

---

## **Features**

- Upload leaf/crop images and detect armyworms instantly  
- Receive a **fun, interactive message**:  
  - 🐛 “UH UH! looks like those nasty worms might be around”  
  - ✅ “All clear! No armyworms detected”  
- Preview uploaded image with prediction  
- Fully responsive frontend  
- Ready to deploy on Render or other cloud providers  

---

## **Folder Structure**

armyworm-detector/
├── backend/
│   ├── server.mjs        # Node.js backend
│   ├── package.json      # dependencies & start script
│   ├── model/
│   │   └── model.onnx    # ONNX model file
│   └── public/
│       ├── index.html    # frontend page
│       ├── style.css
│       └── script.js
└── README.md


---

## **Setup & Run Locally**

1. Clone the repo:

```bash
git clone <your-repo-url>
cd armyworm-detector/backend

### **Install dependencies**
npm install

### **Start the server**
node server.mjs

### **Start the server**
http://localhost:5000

# UPLOAD ANY IMAGE!