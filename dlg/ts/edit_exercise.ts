/// <reference path="./aardio.d.ts"/>

namespace exercise_input {
    export namespace choice_question {
        export interface choice_exercise_info {
            is_multiple: boolean,
            cognition_difficulty: number,
            exercise_difficulty: number,
            knowledge_point: string
        }
        export function get_exercise_info(knowledge_point: string): choice_exercise_info {
            var result: choice_exercise_info;
            result = {
                is_multiple: !!(document.getElementById("question_config_info_isMultiple") as HTMLInputElement).checked,
                exercise_difficulty: (document.getElementById("question_config_info_exercise_difficulty") as HTMLSelectElement).selectedIndex + 1,
                cognition_difficulty: (document.getElementById("question_config_info_cognition_difficulty") as HTMLSelectElement).selectedIndex + 1,
                knowledge_point: knowledge_point
            }
            return result;
        }

        export function get_exercise_item_stem(editor: any): string {
            if (!editor) {
                console.error("参数@1应为wangEditor对象");
                return "";
            }
            var stem: string = editor.txt.html();
            if (stem.trim() === "") {
                console.warn("题干为空");
                alert("题干为空");
                return "";
            }
            return stem;
        }

        export function get_exercise_answer(answerSelector: any): any {
            try {
                var items = answerSelector.get_items();
                var answer = answerSelector.get_result();

                return { items, answer };
            }
            catch (e) {
                console.error("获取题目答题区数据时发生错误");
                console.error(e);
            }
        }

        export function pack_stem(editor: any, answerSelector: any, knowledge_point: string) {
            var rule = get_exercise_info(knowledge_point);
            var answer = get_exercise_answer(answerSelector) || { items: [" "], answer: " " };
            var text = get_exercise_item_stem(editor);

            var stem = {
                rule: rule,
                text: text,
                answer: answer
            }

            var packed_stem = aardio.libquiz.pack_exercise(stem);
            return packed_stem;
        }

        export function unpack_stem(res: string): any {
            return JSON.parse(aardio.libquiz.unpack_exercise(res, true));
        }
    }
}