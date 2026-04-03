import os
import time
import json
from celery import Celery
from groq import Groq

from database import SessionLocal
import models
from utils import log_to_redis
import redis
redis_client = redis.Redis(host='localhost', port=6379, db=1, decode_responses=True)
celery_app = Celery(
    "zenstore_worker",
    broker=os.getenv("REDIS_URL", "redis://localhost:6379/0"),
    backend=os.getenv("REDIS_URL", "redis://localhost:6379/0")
)


@celery_app.task(name="process_product_ai")
def process_product_ai(product_id: int, product_name: str):
    client = Groq(api_key=os.getenv("GROQ_API_KEY"))

    prompt = (
        f"Write a catchy 2-sentence marketing description and define a 1-word "
        f"category for the product: {product_name}. Return ONLY a JSON object "
        f"with keys 'description' and 'category'."
    )

    try:
        completion = client.chat.completions.create(
            model="openai/gpt-oss-120b",
            messages=[{"role": "user", "content": prompt}],
            temperature=1,
            max_completion_tokens=512,
            top_p=1
        )

        raw_response = completion.choices[0].message.content

        # Clean response
        cleaned_response = raw_response.replace("```json", "").replace("```", "").strip()

        # Parse JSON safely
        try:
            ai_data = json.loads(cleaned_response)
        except json.JSONDecodeError:
            ai_data = {}

        description = ai_data.get("description", "Amazing product.")
        category = ai_data.get("category", "General")

        print(f"Simulating image processing for {product_name}...")
        log_to_redis(f"Celery: Starting AI generation for '{product_name}'...")
        time.sleep(3)

        db = SessionLocal()
        try:
            product = db.query(models.Product).filter(models.Product.id == product_id).first()

            if product:
                product.description = description
                product.category = category
                product.status = "completed"
                db.commit()
                print(f"Product {product_id} processed successfully.")
                log_to_redis(f"Celery: Product {product_id} processed successfully!")
                cache_key = f"products_user_{product.user_id}"
                redis_client.delete(cache_key)
                print(f"Cleared cache for user {product.user_id}")
            else:
                print(f"Product {product_id} not found.")

        except Exception as e:
            db.rollback()
            print(f"Database error for product {product_id}: {str(e)}")

        finally:
            db.close()

    except Exception as e:
        print(f"AI processing error for product {product_id}: {str(e)}")
        