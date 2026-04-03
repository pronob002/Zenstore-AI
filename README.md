Absolutely! Here’s the **fully Markdown-styled README** with **all commands included** for setup, installation, and troubleshooting:

````markdown
# 🚀 ZenStore AI

**ZenStore AI** is a full-stack, AI-powered product catalog management system. It enables users to securely manage products, automatically generate marketing descriptions using LLMs, and process large CSV uploads efficiently in the background.

---

## ✨ Core Features

- **Secure Authentication**  
  JWT-based authentication ensures strict user data isolation — users can only access their own products.

- **RESTful API**  
  Endpoints for:  
  - Single product creation  
  - Bulk CSV uploads  
  - Product listing  

- **AI Integration**  
  Uses the Groq API to:  
  - Generate professional 2-sentence marketing descriptions  
  - Automatically categorize products  

- **Asynchronous Processing**  
  Powered by Celery + Redis to:  
  - Handle LLM tasks in the background  
  - Simulate heavy workloads like image processing  
  - Keep the API responsive  

- **Real-Time Dashboard**  
  Built with React (Vite) + Tailwind CSS:  
  - Live terminal streaming Redis worker logs  
  - Clean and responsive UI  

- **API Documentation**  
  Swagger UI available at `/docs`

---

## 🛠️ Technical Constraints Addressed

1. **Object-Oriented Programming (OOP)**  
   Core logic is encapsulated inside `ProductService` class (`services.py`).

2. **Custom Decorator**  
   Implemented `@time_it` (`utils.py`) to measure execution time and push logs to Redis.

3. **Python Generators**  
   Efficient CSV handling via `csv_row_generator` (`main.py`) to yield one row at a time.

4. **Caching Layer**  
   Redis caches product lists and automatically invalidates when new products are processed.

---

## ⚙️ Tech Stack

**Backend:** FastAPI, Python 3, SQLAlchemy, SQLite  
**Frontend:** React.js (Vite), Tailwind CSS, Axios, React Router, Lucide Icons  
**Background & Caching:** Celery, Redis  
**AI Provider:** Groq API  

---

## 🚀 Setup & Installation

### Prerequisites

Ensure the following are installed:

1. **Python 3.10+** (added to PATH)  
2. **Node.js & npm** → [nodejs.org](https://nodejs.org)  
3. **Redis Server** (running on port `6379`)

#### Redis Setup

**Windows:**
- Download: [Redis Windows](https://github.com/tporadowski/redis/releases/download/v5.0.14.1/Redis-x64-5.0.14.1.zip)  
- Extract and run:
```bash
redis-server.exe
````

**Mac/Linux:**

```bash
brew install redis
brew services start redis
```

or

```bash
sudo apt install redis
```

---

## 🔧 Backend Setup

### 1. Clone Repository

```bash
git clone <your-repository-url>
cd zenstore-ai
```

### 2. Create Virtual Environment

**Windows:**

```bash
python -m venv venv
.\venv\Scripts\activate
```

**Mac/Linux:**

```bash
python3 -m venv venv
source venv/bin/activate
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

### 4. Environment Variables

```bash
cp .env.example .env
```

Add your Groq API key:

```env
GROQ_API_KEY=your_api_key_here
```

### 5. Start Celery Worker

**Windows:**

```bash
celery -A worker.celery_app worker --loglevel=info --pool=solo
```

**Mac/Linux:**

```bash
celery -A worker.celery_app worker --loglevel=info
```

### 6. Start FastAPI Server

```bash
uvicorn main:app --reload
```

* API: [http://localhost:8000](http://localhost:8000)
* Swagger Docs: [http://localhost:8000/docs](http://localhost:8000/docs)

---

## 🎨 Frontend Setup

### 1. Navigate to Frontend

```bash
cd frontend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Install Core Packages

```bash
npm install axios react-router-dom lucide-react
```

### 4. Install Tailwind CSS

```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

### 5. Start Development Server

```bash
npm run dev
```

Frontend runs at: [http://localhost:5173](http://localhost:5173)

---

## 🛑 Troubleshooting & Notes

**Tailwind CSS Not Working?**
If the UI appears unstyled:

1. Reinitialize Tailwind:

```bash
npx tailwindcss init -p
```

2. Force Vite rebuild:

```bash
npm run dev -- --force
```

3. Hard refresh browser:

* **Windows:** Ctrl + Shift + R or Ctrl + F5
* **Mac:** Cmd + Shift + R

---


