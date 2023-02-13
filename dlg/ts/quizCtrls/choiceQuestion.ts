declare global{
    interface Window {
        quizCtrls: any;
    }
}


/**QUIZ项目 - 控件 */
export namespace quizCtrls {
    /**选择题 */
    export class choiceQuestion {
        /**控件容器 */
        container: any = {};
        /** **内部** `choice_question` 的静态资源 */
        static = choiceQuestion;
        /**句柄 */
        handle: number = 0;
        /**控件设置 */
        setting: choiceQuestion.ctrlSettingInfo | any;

        /**
         * 控件 - 选择题
         * @param {string | HTMLDivElement} selector JS selector 或 HTML DOM 对象
         * @param {string[]} initialItem 初始选项
         * @param {boolean} isContinuousSelection 是否启用连续选择
         * @param {boolean} isMultiple 是否多选，与连续选择冲突
         * @returns 选择题控件对象
         */
        constructor(selector: string | HTMLDivElement, initialItem?: string[], isContinuousSelection?: boolean, isMultiple?: boolean) {
            if (typeof (selector) === "string") {
                if (!document.querySelector(selector)) {
                    console.error(`无效 selector: "${selector}"`);
                    return;
                }
            }
            this.container = document.createElement("div");
            this.container.className = "quiz-choice-question";

            this.setting = {
                isContinuousSelection: isContinuousSelection || false,
                isMultiple: !isContinuousSelection ? (isMultiple || false) : false
            }

            initialItem = choiceQuestion.checkInitialItem(initialItem, this.setting);

            this.handle = this.static.newCtrl(initialItem, this.setting);

            choiceQuestion.setup(this.handle, this.container);
            (typeof (selector) === "string" ? document.querySelector(selector) : (selector as HTMLDivElement))?.appendChild(this.container);
        }

        /**获取用户输入的答案 */
        getResult(): string | string[] {
            var list = this.static.itemSelected[this.handle];

            var result = new Array();
            list.forEach(function (item: HTMLDivElement) {
                result.push(item.innerText);
            })

            return this.setting.isContinuousSelection ? result : result.pop();
        }

        /**更改控件设置
         * 
         * 若字段**缺失**，则不对该字段进行更改
         * 
         * 若字段**缺失同时未定义**，则使用默认值 `false`
         * 
         * ---
         * 
         * **字段说明**
         * 
         * 
         *  | 字段 | 类型 | 说明 |
         *  | :---: | :----: | :----: |
         *  | `isContinuousSelection` | `boolean` | 是否启用连续选择 |
         *  | `isMultiple` | `boolean` | 是否多选 **(与连续选择冲突)** |
         * 
         * ---
         * 
         * @param {choiceQuestion.ctrlSettingInfo | any} newSetting 控件设置
         */
        setSettings(newSetting: choiceQuestion.ctrlSettingInfo | any) {
            choiceQuestion.setCtrlSetting(this.handle, newSetting);
            this.setting = choiceQuestion.getCtrlSetting(this.handle);
        }

        /**获取项目文本 */
        getItemText(index: number) {
            return choiceQuestion.itemList[this.handle][index].innerText;
        }

        /**由选项文本获取选项引索
         * 
         * 找不到对应选项返回`-1` */
        getItemIndexFromItemText(text: string) {
            var index = -1;
            for (var i = 0; i < choiceQuestion.itemList[this.handle].length; i++) {
                if (choiceQuestion.itemList[this.handle][i].innerText === text) {
                    index = i;
                    break;
                }
            }
            return index;
        }

        /**获取控件设置 */
        getSettings() {
            return choiceQuestion.getCtrlSetting(this.handle);
        }

        /**设置 **鼠标按下** 时的回调函数 **接收参数为 `(handle, ... args)`** */
        setOnclick(func: any) {
            choiceQuestion.setCallBack(this.handle, "onclick", func)
        }

        /**重新设置选项 */
        resetItems(initialItem: any) {
            choiceQuestion.itemInitial[this.handle] = choiceQuestion.checkInitialItem(Object.create(initialItem), choiceQuestion.getCtrlSetting(this.handle));
            choiceQuestion.setup(this.handle, this.container)
        }

        /**选中指定引索的选项，受 `setting.isContinuousSelection` 影响
         * 
         * `index` 若为 `-1` 则清空选中项
        */
        selectIndex(index: number) {
            if (index === -1) {
                choiceQuestion.clearAllItemSelected(this.handle);
                return;
            }
            if (!this.setting.isMultiple) choiceQuestion.clearAllItemSelected(this.handle);
            if (this.setting.isContinuousSelection) choiceQuestion.setItemSelectedByIndex(this.handle, index);
            else {
                if (this.setting.isMultiple && choiceQuestion.getItemStatus(this.handle, index)) choiceQuestion.clearItemSelected(this.handle, index);
                else choiceQuestion.setItemSelected(this.handle, index);
            }
        }
    }

    export namespace choiceQuestion {
        window.quizCtrls = window.quizCtrls || {};
        window.quizCtrls["choiceQuestion"] = choiceQuestion;

        
        /**
         * 选项选中与未选中时的 CSS 类名
         */
        export var itemClassName = {
            hover: "sel-item sel-item-hover",
            checked: "sel-item sel-item-selected",
            unchecked: "sel-item sel-item-non-selected"
        }

        /**总的 choiceQuestion 控件列表 */ export var ctrlList: any[] = [];
        /**控件设置 */ export var ctrlSetting: ctrlSettingInfo[] = [];
        /**初始化的选项 */ export var itemInitial: string[][] = [];
        /**选项列表 */ export var itemList: HTMLDivElement[][] = [];
        /**已经选中的列表 */ export var itemSelected: HTMLDivElement[][] = [];
        /**结果列表 */ export var result: string[][] = [];
        /**事件回调列表 */ export var callBack: any[] = [];

        /**控件设置类型 */
        export interface ctrlSettingInfo {
            /**是否启用连续选择 */ isContinuousSelection: boolean,
            /**是否多选 */ isMultiple: boolean
        }


        /**
         * **(内部)** 鼠标移入时执行
         * @param {Event} event 事件
         * @param {number} handle 句柄
         */
        export function onmousein(event: Event, handle: number): void {
            var index = choiceQuestion.itemList[handle].indexOf(event.target as HTMLDivElement);

            var ctrlSetting = getCtrlSetting(handle);
            var isContinuousSelection = ctrlSetting.isContinuousSelection;
            var isMultiple = ctrlSetting.isMultiple;

            if (!isMultiple && isContinuousSelection) {
                clearAllItemHover(handle);
            }

            if (isContinuousSelection) {
                setItemHoverByIndex(handle, index);
            } else {
                if (isMultiple) {
                    if (getItemStatus(handle, index)) {
                        clearItemHover(handle, index);
                        setItemHover(handle, index);
                    } else {
                        setItemHover(handle, index);
                    }
                } else {
                    if (!getItemStatus(handle, index)) setItemHover(handle, index);
                }
            }
        }

        /**
         * **(内部)** 鼠标移出时执行
         * @param {number} handle 句柄
         */
        export function onmouseout(handle: number) {
            updateStatus(handle);
        }

        /**
         * **(内部)** 鼠标点击时执行
         * @param {Event} event 事件
         * @param {number} handle 句柄
         */
        export function onclick(event: Event, handle: number): any {
            var index: number = choiceQuestion.itemList[handle].indexOf(event.target as HTMLDivElement);

            var ctrlSetting = getCtrlSetting(handle);
            var isContinuousSelection = ctrlSetting.isContinuousSelection;
            var isMultiple = ctrlSetting.isMultiple;

            if (isContinuousSelection) {
                setItemSelectedByIndex(handle, index+1);
            } else {
                if (isMultiple) {
                    if (!getItemStatus(handle, index)) setItemSelected(handle, index);
                    else {
                        clearItemSelected(handle, index);
                    }

                    sortSelectedItem(handle);
                } else {
                    clearAllItemSelected(handle);
                    setItemSelected(handle, index);
                }
            }

            doCallBack(handle, "onclick", [choiceQuestion.itemSelected[handle], index])
        }

        /**
         * **(内部)** 执行回调
         * @param {number} handle 句柄
         * @param {string} className 类名
         * @param {any[]} args 参数表 （数组）
         * @return {any} 回调函数的返回值
         */
        export function doCallBack(handle: number, className: string, args: any[]): any {
            return getCallBack(handle, className)(handle, ...args);
        }

        /**
         * 获取回调函数
         * @param {number} handle 句柄
         * @param {string} className 类名
         * @returns {any} 回调函数
         */
        export function getCallBack(handle: number, className: string): any {
            return choiceQuestion.callBack[handle][className];
        }

        /**
         * 设置回调函数
         * @param {number} handle 句柄
         * @param {string} className 类名
         * @param {any} callback 回调函数, **接收参数为 `(handle, ... args)`**
         */
        export function setCallBack(handle: number, className: string, callback: any) {
            choiceQuestion.callBack[handle][className] = callback || function () { };
        }

        /**
         * 获取选项选中状态
         * @param {number} handle 句柄
         * @param {index} index 选项引索
         * @return {boolean} 选中状态
         */
        export function getItemStatus(handle: number, index: number): boolean {
            //return choice_question.itemSelected[handle].includes(choice_question.itemList[handle][index])
            return choiceQuestion.itemSelected[handle].indexOf(choiceQuestion.itemList[handle][index]) !== -1;
        }

        /**
         * 更改控件设置
         * @param {number} handle 句柄
         * @param {ctrlSettingInfo} setting 设置
         */
        export function setCtrlSetting(handle: number, setting: choiceQuestion.ctrlSettingInfo) {
            if (!choiceQuestion.ctrlSetting[handle]) choiceQuestion.ctrlSetting[handle] = setting;
            choiceQuestion.ctrlSetting[handle].isContinuousSelection = setting.isContinuousSelection || (choiceQuestion.ctrlSetting[handle].isContinuousSelection || false);
            choiceQuestion.ctrlSetting[handle].isMultiple = setting.isMultiple || (choiceQuestion.ctrlSetting[handle].isMultiple || false);
        }

        /**
         * 获取控件设置
         * @param handle 句柄
         * @returns {ctrlSettingInfo} 控件设置
         */
        export function getCtrlSetting(handle: number): choiceQuestion.ctrlSettingInfo {
            return choiceQuestion.ctrlSetting[handle];
        }

        /**
         * 清除**所有**选中项选中状态，并**移除**结果
         * @param {number} handle 句柄
         */
        export function clearAllItemSelected(handle: number): void {
            choiceQuestion.itemSelected[handle] = [];

            choiceQuestion.itemList[handle].forEach(function (item: HTMLDivElement) {
                item.className = itemClassName.unchecked;
            });
        }

        /**
         * 清除**所有**预选中项覆盖状态，即**不清空**结果
         * @param {number} handle 句柄
         */
        export function clearAllItemHover(handle: number) {
            choiceQuestion.itemList[handle].forEach(function (item: HTMLDivElement) {
                item.className = itemClassName.unchecked;
            });
        }

        /**
         * 设置引索为 `index` 的选项为选中状态
         * @param {number} handle 句柄
         * @param {number} index 选项引索
         */
        export function setItemSelected(handle: number, index: number): void {
            choiceQuestion.itemList[handle][index].className = itemClassName.checked;
            choiceQuestion.itemSelected[handle].push(choiceQuestion.itemList[handle][index]);
        }

        /**
         * 设置引索为 `index` 的选项为预选中 (即鼠标覆盖) 状态
         * @param {number} handle 句柄
         * @param {number} index 选项引索
         */
        export function setItemHover(handle: number, index: number): void {
            choiceQuestion.itemList[handle][index].className = itemClassName.hover;
        }

        /**
         * 取消选项覆盖状态
         * @param {number} handle 句柄
         * @param {number} index 选项引索
         */
        export function clearItemHover(handle: number, index: number) {
            choiceQuestion.itemList[handle][index].className = itemClassName.unchecked;
        }

        /**
         * 取消选项选中状态，并将其移出选项列表
         * @param handle 句柄
         * @param index 选项引索
         */
        export function clearItemSelected(handle: number, index: number) {
            var target = choiceQuestion.itemList[handle][index];
            target.className = itemClassName.unchecked;

            choiceQuestion.itemSelected[handle] = choiceQuestion.itemSelected[handle].filter(function (item: HTMLDivElement) {
                if (item.innerText != target.innerText) return true;
            })
        }

        /**
         * 设置引索为 `index` 的选项 和 其前面的选项为选中状态
         * @param {number} handle 句柄
         * @param {number} index 选项引索
         */
        export function setItemSelectedByIndex(handle: number, index: number): void {
            choiceQuestion.itemSelected[handle] = [];
            var length = choiceQuestion.itemList[handle].length;

            for (var i = 0; i < index && i < length; i++) {
                choiceQuestion.itemList[handle][i].className = itemClassName.checked;
                choiceQuestion.itemSelected[handle].push(choiceQuestion.itemList[handle][i]);
            }
        }

        /**
         * **设置引索为 `index` 的选项**和**其前面的选项**为预选中 (即鼠标覆盖) 状态
         * @param {number} handle 句柄
         * @param {number} index 选项引索
         */
        export function setItemHoverByIndex(handle: number, index: number): void {
            var length = choiceQuestion.itemList[handle].length;

            for (var i = 0; i <= index && i < length; i++) {
                choiceQuestion.itemList[handle][i].className = itemClassName.hover;
            }
        }

        /**
         * 根据记录的 `itemSelected` 刷新控件显示状态
         * @param handle 句柄
         */
        export function updateStatus(handle: number): void {
            clearAllItemHover(handle);
            choiceQuestion.itemSelected[handle].forEach(function (item: any) {
                item.className = itemClassName.checked;
            })
        }

        /**
         * 整理 `itemSelected` 
         * @param {number} handle 句柄
         */
        export function sortSelectedItem(handle: number): void {
            choiceQuestion.itemSelected[handle] = choiceQuestion.itemSelected[handle].sort(function (a: HTMLDivElement, b: HTMLDivElement) {
                return a.innerText.charCodeAt(0) - b.innerText.charCodeAt(0);
            });
        }

        /**
         * 检查输入的选项是否合规
         * @param {string[]} initialItem 初始项目
         * @param {ctrlSettingInfo} setting 控件设置
         * @returns {string[]} 返回处理过的选项
         */
        export function checkInitialItem(initialItem?: string[], setting?: ctrlSettingInfo): string[] {
            var isContinuousSelection = setting?.isContinuousSelection || false;
            if (initialItem) {
                if (initialItem[initialItem.length - 1] !== "+" && isContinuousSelection) {
                    initialItem.push("+");
                }
            } else {
                initialItem = ["A", "B", "C", "D"];
                if (isContinuousSelection) initialItem = initialItem.concat(["E", "+"]);
            }

            return initialItem;
        }

        /**
         * 注册控件，返回句柄
         * @returns {number} 句柄
         */
        export function registCtrl(): number {
            var ctrlNumber = choiceQuestion.ctrlList.push("registed");
            return ctrlNumber;
        }

        /**
         * 配置控件的基本信息，初始化基本属性
         * @param {string[]} initialItem 初始项目
         * @returns {number} 返回句柄
         */
        export function newCtrl(initialItem: string[], setting: choiceQuestion.ctrlSettingInfo): number {
            var newHandle = registCtrl();

            choiceQuestion.itemList[newHandle] = new Array(); // 初始化基本属性
            choiceQuestion.itemSelected[newHandle] = new Array();
            choiceQuestion.callBack[newHandle] = {};
            choiceQuestion.itemInitial[newHandle] = checkInitialItem(initialItem);
            setCtrlSetting(newHandle, setting);

            return newHandle;
        };

        /**
         * 新建选项
         * @param {number} handle 句柄
         * @param {HTMLDivElement} container 选项容器
         */
        export function newItem(handle: number, container: HTMLDivElement): void {
            choiceQuestion.itemInitial[handle].pop();
            var lastItem = choiceQuestion.itemInitial[handle][choiceQuestion.itemInitial[handle].length - 1];
            lastItem = String.fromCharCode(lastItem.charCodeAt(0) + 1);

            choiceQuestion.itemList[handle] = [];
            choiceQuestion.itemSelected[handle] = [];

            choiceQuestion.itemInitial[handle].push(lastItem);
            choiceQuestion.itemInitial[handle].push("+");

            choiceQuestion.setup(handle, container);
        }

        /**
         * 配置选项
         * @param handle 句柄
         * @param item 新建项文本
         */
        export function setupItem(handle: number, container: HTMLDivElement, item: string | any): HTMLDivElement {
            var newItem: any = document.createElement("div");
            var id: string = `sel-item-${item}`;

            newItem.innerHTML = item;
            newItem.className = itemClassName.unchecked;
            newItem.id = id;

            if (item !== "+") {
                var handlePass = handle
                newItem.onmouseenter = function (event: Event) {
                    choiceQuestion.onmousein(event, handlePass);
                }
                newItem.onmouseout = function (event: Event) {
                    choiceQuestion.onmouseout(handlePass)
                }

                newItem.onclick = function (event: Event) {
                    choiceQuestion.onclick(event, handlePass);
                }
            } else {
                newItem.onclick = function () {
                    choiceQuestion.newItem(handle, container)
                }
            }

            return newItem;
        }

        /**
         * 创建控件
         * @param {number} handle 句柄
         * @param {HTMLDivElement} container 选项容器
         */
        export function setup(handle: number, container: HTMLDivElement): void {
            container.innerHTML = "";
            choiceQuestion.itemList[handle] = [];
            choiceQuestion.itemSelected[handle] = [];

            for (var i = 0; i < choiceQuestion.itemInitial[handle].length; i++) {
                var item = choiceQuestion.itemInitial[handle][i];

                var newItem = setupItem(handle, container, item);

                container?.appendChild(newItem);
                choiceQuestion.itemList[handle].push(newItem);
            }

            if (!choiceQuestion.getCallBack(handle, "onclick")) choiceQuestion.setCallBack(handle, "onclick", function () { });
        }
    }
}
export default quizCtrls.choiceQuestion
