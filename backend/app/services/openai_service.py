import openai
import json
import os
from typing import Dict, List, Optional
from dotenv import load_dotenv

load_dotenv()

openai.api_key = os.getenv("OPENAI_API_KEY")

class OpenAIService:
    def __init__(self):
        self.client = openai.OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
    
    async def generate_exercise(self, grammar: str, exercise_type: str) -> Dict:
        prompt = f"""
        你是日语教师，请为语法「{grammar}」生成 3 道 {exercise_type} 练习题。
        输出 JSON 格式，包括：
        - 题目内容 (question)
        - 正确答案 (correct_answer)
        - 中文解析 (explanation)
        - 3 个干扰项 (options)（若题型为选择题）
        
        请确保返回有效的JSON格式。
        """
        
        try:
            response = self.client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "You are a Japanese language teacher. Always respond in valid JSON format."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7,
                response_format={"type": "json_object"}
            )
            
            return json.loads(response.choices[0].message.content)
        except Exception as e:
            print(f"Error generating exercise: {e}")
            return self._get_default_exercise(grammar, exercise_type)
    
    async def check_answer(self, grammar: str, user_answer: str, correct_answer: str) -> Dict:
        prompt = f"""
        以下是用户提交的回答，请判断正误并用中文解释：
        - 语法点：「{grammar}」
        - 用户作答：「{user_answer}」
        - 正确答案：「{correct_answer}」
        
        请输出JSON格式，包含：
        - result: 判断结果（correct/incorrect）
        - explanation: 中文解释
        - suggestion: 建议改写（如果错误）
        """
        
        try:
            response = self.client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "You are a Japanese language teacher. Always respond in valid JSON format."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.5,
                response_format={"type": "json_object"}
            )
            
            return json.loads(response.choices[0].message.content)
        except Exception as e:
            print(f"Error checking answer: {e}")
            is_correct = user_answer.strip() == correct_answer.strip()
            return {
                "result": "correct" if is_correct else "incorrect",
                "explanation": "答案正确！" if is_correct else f"正确答案是：{correct_answer}",
                "suggestion": None if is_correct else correct_answer
            }
    
    async def generate_dialogue_response(self, scenario: str, user_message: str, history: List[Dict]) -> Dict:
        context = f"你正在进行{scenario}场景的日语对话练习。"
        messages = [
            {"role": "system", "content": f"{context} 请用自然的日语回复用户，并保持对话连贯。"}
        ]
        
        for msg in history[-5:]:
            messages.append({"role": msg["role"], "content": msg["text"]})
        
        messages.append({"role": "user", "content": user_message})
        
        try:
            response = self.client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=messages,
                temperature=0.8
            )
            
            return {"reply": response.choices[0].message.content}
        except Exception as e:
            print(f"Error generating dialogue: {e}")
            return {"reply": "すみません、もう一度お願いします。"}
    
    async def correct_japanese(self, message: str) -> Dict:
        prompt = f"""
        请检查这句日语是否自然，有无语法错误、表达不自然的地方。
        提供更自然的表达、解释原因，并翻译为中文。
        句子：「{message}」
        
        请返回JSON格式：
        - corrected: 修正后的句子
        - explanation: 错误说明
        - zh: 中文翻译
        """
        
        try:
            response = self.client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "You are a Japanese language teacher. Always respond in valid JSON format."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.5,
                response_format={"type": "json_object"}
            )
            
            return json.loads(response.choices[0].message.content)
        except Exception as e:
            print(f"Error correcting Japanese: {e}")
            return {
                "corrected": message,
                "explanation": "无法检查该句子",
                "zh": "无法翻译"
            }
    
    def _get_default_exercise(self, grammar: str, exercise_type: str) -> Dict:
        if exercise_type == "choice":
            return {
                "questions": [
                    {
                        "question": f"次の文の（　）に入る正しいものを選びなさい。\n昨日は雨（　）、試合は中止になった。",
                        "options": ["だから", "でも", "それで", "のに"],
                        "correct_answer": "だから",
                        "explanation": f"「{grammar}」は原因・理由を表す接続詞です。"
                    }
                ]
            }
        elif exercise_type == "fill_in_the_blank":
            return {
                "questions": [
                    {
                        "question": f"次の文の（　）に「{grammar}」を使って適切な形を入れなさい。",
                        "correct_answer": grammar,
                        "explanation": f"「{grammar}」の基本的な使い方です。"
                    }
                ]
            }
        else:
            return {
                "questions": [
                    {
                        "question": f"「{grammar}」を使って文を作りなさい。",
                        "correct_answer": "（例文）",
                        "explanation": f"「{grammar}」を使った例文を作成してください。"
                    }
                ]
            }

openai_service = OpenAIService()