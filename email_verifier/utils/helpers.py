import random
import string

def random_8_chars() -> str:
    return ''.join(random.choices(string.ascii_lowercase + string.digits, k=8))
