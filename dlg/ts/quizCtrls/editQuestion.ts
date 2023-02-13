import wangEditor from "../lib/wangEditor/wangEditor";
import choiceQuestion from "./choiceQuestion"

declare global{
    interface Window {
        quizCtrls: any;
    }
}


/** 控件 */
export namespace quizCtrls {
    /**题目编辑控件 */
    export class editQuestion {
        handle: handle;
        container: HTMLDivElement | any;
        /**
         * 
         * @param {string | HTMLDivElement} selector 选择器或 `HTML div` 元素
         */
        constructor(selector: string | HTMLDivElement, question: quizQuestion) {
            this.handle = editQuestion.newCtrl(question);
            editQuestion.setup(this.handle, selector);
        }

        setText(text: string): void{
            editQuestion.editorEle[this.handle].txt.html(text);
        }

        setOptions(options: string[]): void{
            let option = editQuestion.ctrlEle[this.handle].optionInput;
            option.resetItems(options);
            option.selectIndex(options.length);

            editQuestion.ctrlEle[this.handle].answerInput.resetItems(option.getResult());
        }

        setAnswer(answer: string | string[] | any): void{
            let answerInput = editQuestion.ctrlEle[this.handle].answerInput;
            let index = answerInput.getItemIndexFromItemText(answer);
            if(index === -1) {
                console.warn("找不到目标选项, 无法进行设置");
                return;
            }
            answerInput.selectIndex(index);
        }

        setConfigItem(item: string, value: any): void{
            if(editQuestion.ctrlEle[this.handle].config[item]) editQuestion.ctrlEle[this.handle].config[item].setValue(value);
            else console.warn(`找不到指定项 "${item}"`);
        }

        setOnStore(func: Function): void{
            editQuestion.setCallBack(this.handle, "onStore", func);
        }



        getText(): string{
            return editQuestion.editorEle[this.handle].txt.html() as string;
        }

        getOptions(): string[]{
            return editQuestion.ctrlEle[this.handle].optionInput.getResult() as string[];
        }

        getAnswer(): string{
            return editQuestion.ctrlEle[this.handle].answerInput.getResult() as string;
        }

        getConfigItem(item: string): any{
            return editQuestion.ctrlEle[this.handle].config[item].getValue();
        }

        preview(): void{
            editQuestion.buttonCommand.preview(this.handle);
        }
    }


    export namespace editQuestion {
        window.quizCtrls = window.quizCtrls || {};
        window.quizCtrls["editQuestion"] = editQuestion;

        /**总的 editQuestion 控件列表 */ export let ctrlList: any[] = [];
        /**储存控件元素 */ export let ctrlEle: ctrlEles[] = [];
        /**editor */ export let editorEle: wangEditor[] = [];
        /**编辑的问题 */export let question: quizQuestion[] = [];
        /**事件回调列表 */ export let callBack: any[] = [];

        export interface ctrlEles {
            /**控件容器 */
            container: HTMLDivElement,
            /**编辑框容器 */
            editorArea: HTMLDivElement,
            /**选项输入控件 */
            optionInput: choiceQuestion,
            /**答案输入控件 */
            answerInput: choiceQuestion,
            /**预览组件容器 */
            previewStemArea: HTMLDivElement,
            /**预览区的答案输入控件 */
            previewAnswer: choiceQuestion,
            /**题目配置 */
            config: configAreaItems
        }

        interface configAreaItems {
            [index: string]: {
                /**该项目的 `HTML` 元素 */
                element: HTMLElement,
                /**获取结果 */
                getValue: Function,
                /**设置值 */
                setValue: Function
            }
        }

        /**题目配置 项目 */
        interface configItems {
            [index: string]: {
                /**种类 (`"boolean"`, `"selection"`) */
                type: string,
                /**文本 */
                text: string,
                /**选择项目 (仅 `type="selection"`) */
                items?: {
                    /**文本 */
                    text: string,
                    /**值 */
                    value: number
                }[]
            }
        }

        /**
         * 新建并初始化一个控件
         * @param {quizQuestion} questionInput 问题
         * @returns 新句柄
         */
        export function newCtrl(questionInput: quizQuestion): number {
            let ctrlNumber: number = editQuestion.ctrlList.length;
            let newHandle = ctrlNumber++;
            editQuestion.ctrlList.push("registed");

            editQuestion.ctrlEle[newHandle] = (new Object() as ctrlEles);
            editQuestion.question[newHandle] = (questionInput as quizQuestion);
            editQuestion.callBack[newHandle] = new Object();
            return newHandle;
        };

        /**
         * 配置控件
         * @param {handle} handle 句柄
         * @param {string | HTMLDivElement} selector 控件容器
         */
        export function setup(handle: handle, selector: string | HTMLDivElement): void{
            let container = document.createElement("div");
            container.className = "quiz-editQuestion"
            editQuestion.ctrlEle[handle].container = container;

            setupEditorArea(handle);
            setupAnswerArea(handle);
            setupPreviewArea(handle);
            setupConfigArea(handle);
            setupButtonArea(handle);

            (typeof(selector) === "string" ? document.querySelector(selector) : selector)?.appendChild(container);
            doCallBack(handle, "afterSetup");
        }

        /**
         * 配置题干编辑区
         * @param {handle} handle 句柄 
         */
        export function setupEditorArea(handle: handle): void{
            let editorArea = document.createElement("div");
            editorArea.className = "editorArea";

            let editor = new wangEditor(editorArea);
            editor.config.menuTooltipPosition = 'down';
            editor.config.uploadImgShowBase64 = true;
            editor.config.showLinkImg = false;
            editor.config.excludeMenus = [
                'emoticon',
                'video',
                'link',
                'quote',
                'todo',
                'code',
                'backColor',
                'splitLine'
            ]
            editor.config.fontNames = [
                { name: "黑体", value: "黑体" },
                { name: "宋体", value: "宋体" },
                { name: "华文宋体", value: "华文宋体" },
                { name: "华文中宋", value: "华文中宋" },
                { name: "华文仿宋", value: "华文仿宋" },
                { name: "华文楷体", value: "华文楷体" },
                { name: "Times New Roman", value: "Times New Roman" },
                { name: "Arial", value: "Arial" }
            ]

            editQuestion.editorEle[handle] = editor;
            editQuestion.ctrlEle[handle].editorArea = editorArea;

            editor.config.pasteTextHandle = function(pasteStr: string){
                return aardio.convert_pasteStr(pasteStr);
            }

            setCallBack(handle, "afterSetup", function(handle: handle){
                editQuestion.ctrlEle[handle].container.appendChild(editQuestion.ctrlEle[handle].editorArea);
                editQuestion.editorEle[handle].config.height = editQuestion.ctrlEle[handle].editorArea.clientHeight - 41;
                editQuestion.editorEle[handle].create();
            });
        }

        /**
         * 配置题目答案输入区
         * @param {handle} handle 句柄
         */
        export function setupAnswerArea(handle: handle): void{
            let container = document.createElement("div");
            container.className = "optionAnswerInput";

            let optionInputArea = document.createElement("div");
            optionInputArea.className = "option";
            let optionInputAreaCtrl = document.createElement("div");
            optionInputAreaCtrl.className = "optionInput";
            optionInputArea.appendChild(optionInputAreaCtrl);
            let optionTitle = document.createElement("div");
            optionTitle.className = "title";
            optionTitle.innerHTML = "勾选选项";
            optionInputArea.appendChild(optionTitle);

            let answerInputArea = document.createElement("div");
            answerInputArea.className = "answer";
            let answerInputAreaCtrl = document.createElement("div");
            answerInputAreaCtrl.className = "answerInput";
            answerInputArea.appendChild(answerInputAreaCtrl);
            let answerTitle = document.createElement("div");
            answerTitle.className = "title";
            answerTitle.innerHTML = "输入答案";
            answerInputArea.appendChild(answerTitle);

            let optionInput = new choiceQuestion(optionInputAreaCtrl, undefined, true);
            let answerInput = new choiceQuestion(answerInputAreaCtrl, [], false);

            optionInput.setOnclick(function(){ answerInput.resetItems(optionInput.getResult()) });

            editQuestion.ctrlEle[handle].optionInput = optionInput;
            editQuestion.ctrlEle[handle].answerInput = answerInput;

            container.appendChild(optionInputArea);
            container.appendChild(answerInputArea);
            editQuestion.ctrlEle[handle].container.appendChild(container);
        }

        /**
         * 配置题目预览区
         * @param {handle} handle 
         */
        export function setupPreviewArea(handle: handle): void{
            let container = document.createElement("div");
            container.className = "previewArea";
            
            let preview = document.createElement("div");
            preview.className = "preview";

            let previewStem = document.createElement("div");
            previewStem.className = "stem";

            let previewAnswer = document.createElement("div");
            previewAnswer.className = "answer";

            editQuestion.ctrlEle[handle].previewStemArea = previewStem;
            editQuestion.ctrlEle[handle].previewAnswer = new choiceQuestion(previewAnswer, [], false);

            let title = document.createElement("p");
            title.innerHTML = "答题区预览";

            let previewContainer = document.createElement("div");
            previewContainer.appendChild(previewStem);
            previewContainer.appendChild(previewAnswer);
            preview.appendChild(previewContainer);
            preview.appendChild(title);

            container.appendChild(preview);
            editQuestion.ctrlEle[handle].container.appendChild(container);
        }

        /**
         * 配置题目配置区
         * @param {handle} handle 句柄 
         */
        export function setupConfigArea(handle: handle){
            let container = document.createElement("div");
            container.className = "configArea";

            let title = document.createElement("p");
            title.innerHTML = "题目属性";
            container.appendChild(title);

            let itemContainer = document.createElement("div");
            itemContainer.className = "itemContainer";
            container.appendChild(itemContainer);

            ctrlEle[handle].config = {};

            for(let key in configItems){
                switch (configItems[key].type) {
                    case "boolean": {
                        const itemBox = document.createElement("div");
                        const itemLabel = document.createElement("label");
                        const itemInput = document.createElement("input");

                        itemInput.type = "checkbox";
                        itemInput.id = `editQuestion-config-${handle}-${key}`;

                        itemLabel.innerText = `${configItems[key].text} `;

                        ctrlEle[handle].config[key] = {
                            element: itemInput,
                            getValue: function(): boolean{
                                return itemInput.checked;
                            },
                            setValue: function(value: boolean): void{
                                itemInput.checked = !!value;
                            }
                        }

                        itemLabel.appendChild(itemInput);
                        itemBox.appendChild(itemLabel);
                        itemContainer.appendChild(itemBox);

                        break;
                    }
                    case "selection": {
                        if(!configItems[key].items) return;

                        const itemBox = document.createElement("div");
                        const itemLabel = document.createElement("label");
                        const itemSelect = document.createElement("select");

                        itemSelect.id = `editQuestion-config-${handle}-${key}`;

                        itemLabel.innerText = `${configItems[key].text} `;

                        for (const item of configItems[key].items || []) {
                            let newOption = document.createElement("option");
                            newOption.innerText = item.text;
                            itemSelect.appendChild(newOption);
                        }

                        ctrlEle[handle].config[key] = {
                            element: itemSelect,
                            getValue: function(): number{
                                const selText = itemSelect.value;

                                for (const item of configItems[key].items || []) {
                                    if(item.text === selText) return item.value;
                                }
                                return 0;
                            },
                            setValue: function(value: string | number): void{
                                let items = configItems[key].items?.map(function(item){
                                    return item.text;
                                })
                                if(typeof(value) === "string"){
                                    let index = items?.indexOf(value);
                                    itemSelect.selectedIndex = (index !== -1 && (index || index === 0)) ? index - 1 : (()=>{ console.warn(`[config.setValue] [type=string] 目标值 "${value}" 不存在`); return itemSelect.selectedIndex; })();
                                }else if(typeof(value) === "number"){
                                    itemSelect.selectedIndex = (value >= 0 && value < (items || []).length) ? value - 1 : (()=>{ console.warn(`[config.setValue] [type=number] 目标引索 "${value}" 不存在`); return itemSelect.selectedIndex; })();
                                }
                            }
                        }

                        itemLabel.appendChild(itemSelect);
                        itemBox.appendChild(itemLabel);
                        itemContainer.appendChild(itemBox);

                        break;
                    }
                    case "knowledge_point": {
                        const itemBox = document.createElement("div");

                        let itemLabel = document.createElement("label");
                        itemLabel.id = `editQuestion-config-${handle}-${key}-label`;
                        itemLabel.innerText = `${configItems[key].text}：`;

                        let knwldgPntPath = document.createElement("div");
                        knwldgPntPath.className = "config-list-path";
                        knwldgPntPath.id = `editQuestion-config-${handle}-${key}-path`;
                        knwldgPntPath.innerText = ``;

                        let knwldgPntButton = document.createElement("button");
                        knwldgPntButton.innerText = `…`;
                        knwldgPntButton.style.float = "right";

                        knwldgPntButton.onclick = function(){
                            let path = aardio.libquiz.get_value_knowledge_point();
                            knwldgPntPath.innerText = path
                            knwldgPntPath.title = path;
                        }

                        ctrlEle[handle].config[key] = {
                            element: knwldgPntPath,
                            getValue: function(): string{
                                return knwldgPntPath.innerText;
                            },
                            setValue: function(value: string): void{
                                knwldgPntPath.innerText = value;
                            }
                        }

                        itemBox.appendChild(itemLabel);
                        itemLabel.appendChild(knwldgPntPath);
                        itemLabel.appendChild(knwldgPntButton);


                        itemContainer.appendChild(itemBox);

                        //aardio.libquiz.get_value_knowledge_point()
                        break;
                    }
                    
                    default: {
                        console.warn(`找不到类名 "${configItems[key].type}" 对应的处理方法，请检查 "editQuestion.configItems" 及对其的修改`);
                    }
                }
            }

            editQuestion.ctrlEle[handle].container.appendChild(container);
        }

        /**
         * 配置按钮功能区
         * @param {handle} handle 句柄 
         */
        export function setupButtonArea(handle: handle){
            let container = document.createElement("div");
            container.className = "buttonArea";

            let previewButton = document.createElement("button");
            previewButton.innerText = "预览题目";
            previewButton.className = "preview";
            previewButton.onclick = function(){
                buttonCommand.preview(handle);
            }

            let storeButton = document.createElement("button");
            storeButton.innerText = "保存题目";
            storeButton.className = "store";
            storeButton.onclick = function(){
                buttonCommand.store(handle);
            }

            container.appendChild(previewButton);
            container.appendChild(storeButton);

            editQuestion.ctrlEle[handle].container.appendChild(container);
        }

        /**
         * 按钮绑定的方法
         * 
         * `preview` 预览题目
         * 
         * `store` 保存题目
         */
        export let buttonCommand = {
            /**预览题目 */
            preview: (handle: handle) => {
                editQuestion.ctrlEle[handle].previewAnswer.resetItems(editQuestion.ctrlEle[handle].optionInput.getResult());
                editQuestion.ctrlEle[handle].previewStemArea.innerHTML = editQuestion.editorEle[handle].txt.html() as string;
            },
            /**保存题目 */
            store: (handle: handle) => {
                const question: quizQuestion = {
                    rule: {
                        cognition_difficulty: ctrlEle[handle].config["cognition_difficulty"].getValue() as number,
                        exercise_difficulty: ctrlEle[handle].config["exercise_difficulty"].getValue() as number,
                        knowledge_point: ctrlEle[handle].config["knowledge_point"].getValue() as string,
                        is_multiple: ctrlEle[handle].config["is_multiple"].getValue() as boolean
                    },
                    text: editorEle[handle].txt.html() as string,
                    answer: {
                        items: editQuestion.ctrlEle[handle].optionInput.getResult() as string[],
                        answer: editQuestion.ctrlEle[handle].answerInput.getResult() as string
                    }
                }

                const questionPacked = aardio.libquiz.pack_exercise(question);

                doCallBack(handle, "onStore", questionPacked)
                return 
            }
        }

        /**题目配置的项目 */
        export let configItems: configItems = {
            "is_multiple": {
                type: "boolean",
                text: "是否多选"
            },
            "exercise_difficulty": {
                type: "selection",
                text: "题目难度",
                items: [
                    {
                        text: "容易",
                        value: 1
                    },
                    {
                        text: "中等",
                        value: 2
                    },
                    {
                        text: "困难",
                        value: 3
                    }
                ]
            },
            "cognition_difficulty": {
                type: "selection",
                text: "认知难度",
                items: [
                    {
                        text: "容易",
                        value: 1
                    },
                    {
                        text: "中等",
                        value: 2
                    },
                    {
                        text: "困难",
                        value: 3
                    }
                ]
            },
            "knowledge_point": {
                type: "knowledge_point",
                text: "知识点"
            }
        }

        /**
         * **(内部)** 执行回调
         * @param {number} handle 句柄
         * @param {string} className 类名
         * @param {any[]} args 参数表 （数组）
         * @return {any} 回调函数的返回值
         */
        export function doCallBack(handle: number, className: string, ...args: any[]): any {
            return getCallBack(handle, className)(handle, ...(args || []));
        }

        /**
         * 获取回调函数
         * @param {number} handle 句柄
         * @param {string} className 类名
         * @returns {any} 回调函数
         */
        export function getCallBack(handle: number, className: string): any {
            return editQuestion.callBack[handle][className] || function () { };
        }

        /**
         * 设置回调函数
         * @param {number} handle 句柄
         * @param {string} className 类名
         * @param {any} callback 回调函数, **接收参数为 `(handle, ... args)`**
         */
        export function setCallBack(handle: number, className: string, callback: any) {
            editQuestion.callBack[handle][className] = callback || function () { };
        }
    }
}

export default quizCtrls.editQuestion
