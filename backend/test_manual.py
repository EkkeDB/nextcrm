import psycopg2

try:
    conn = psycopg2.connect(
        dbname='nextcrm',
        user='nextcrm_user',
        password='nextcrm_password_2024',
        host='127.0.0.1',
        port='5432'
    )
    print("✅ Manual connection worked!")
    conn.close()
except Exception as e:
    print(f"❌ Manual connection failed: {repr(e)}")
