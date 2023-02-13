/**控件句柄 */
declare type handle = number;


//==================================================


/**Quiz 题目信息(规则) */
declare interface quizQuestionRule{
    /**认知难度 */
    cognition_difficulty: number,

    /**题目难度 */
    exercise_difficulty: number,

    /**是否多选 */
    is_multiple: boolean,

    /**知识点 */
    knowledge_point: string
}

/**Quiz 题目答案，选项信息 */
declare interface quizQuestionAnswer{
    /**题目答案 */
    answer: string,

    /**选项 */
    items: string[]
}

/**Quiz 题目 */
declare interface quizQuestion{
    /**规则(题目信息) */
    rule: quizQuestionRule,

    /**选项，答案 */
    answer: quizQuestionAnswer,

    /**题干文本 */
    text: string
}

/**Quiz 试卷信息 */
declare interface quizPaperInfo{
    /**试卷标题 */
    title: string,

    /**试卷启用时间 */
    begin_time: string,

    /**试卷截止时间 */
    end_time: string,

    /**学科 */
    subject: string,

    /**知识点 */
    knowledge_point: string,

    /**难度 */
    difficulty: number,

    /**时长 */
    time_limit: number,

    /**限制答题时间为启用时间至截止时间 */
    only_available_in_legal_time: boolean

    //文件版本
    
}

/**Quiz 试卷 */
declare interface quizPaper{
    /**试卷题目列表 */
    questions: quizQuestion[],
    
    /**试卷信息 */
    info: quizPaperInfo
}


//==================================================


/**Quiz 试卷报告-信息类型 */
declare interface quizPaperReportInfo{
    /**学生信息 */
    student: quizStudentInfo,
    /**答题时长 */
    duration: number

    //开始答题时间
    //结束答题时间
    //版本信息
}

/**Quiz 试卷报告类型 */
declare interface quizPaperReport{
    /**信息 */
    info: quizPaperReportInfo,
    /**试卷 */
    paper: quizPaper,
    /**用户答案 */
    userAnswer: any[]
}


//===============================================


/**Quiz 学生信息类型 */
declare interface quizStudentInfo{
    /**姓名 */
    name: string,
    /**年级 */
    grade: string,
    /**班级 */
    className: string
}