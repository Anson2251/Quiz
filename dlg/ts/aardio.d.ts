/**导入的 aardio 接口，需在使用前将 external 赋值给 aardio */
declare namespace aardio {
    namespace libquiz {
        /**打包题目 */
        function pack_exercise(arg: any): string;

        /**解包题目 */
        function unpack_exercise(str: string, needPacked: boolean): any;

        /**获取知识点位置 */
        function get_value_knowledge_point(): string
    }

    namespace exercise {
        function get(): void;
    }

    /**
     * 将粘贴字符串中的 `<img>` 标签进行修改，嵌入图片数据
     * @param {string} pasteStr 粘贴的字符串
     * @returns {string} 处理过后的字符串
     */
    function convert_pasteStr(pasteStr: string): string;
}