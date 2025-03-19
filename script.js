// 音と数字のマッピング
const noteToNumber = {
  'C': 0, 'C#': 1, 'Db': 1, 'D♭': 1, 'D': 2, 'D#': 3, 'Eb': 3, 'E♭': 3, 'E': 4,
  'F': 5, 'F#': 6, 'Gb': 6, 'G♭': 6, 'G': 7, 'G#': 8, 'Ab': 8, 'A♭': 8, 'A': 9,
  'A#': 10, 'Bb': 10, 'B♭': 10, 'B': 11
};

// 数字から音へのマッピング
const numberToNote = {
  0: 'C', 
  1: ['C#', 'D♭'], 
  2: 'D', 
  3: ['D#', 'E♭'], 
  4: 'E',
  5: 'F', 
  6: ['F#', 'G♭'], 
  7: 'G', 
  8: ['G#', 'A♭'], 
  9: 'A',
  10: ['A#', 'B♭'], 
  11: 'B'
};

// 関係性のマッピング（度数）
const relationMapping = [
  { number: 0, relations: ['1度'] },
  { number: 1, relations: ['短2度', '♭9th'] },
  { number: 2, relations: ['2度', '9th'] },
  { number: 3, relations: ['短3度', '#9th', 'm3'] },
  { number: 4, relations: ['3度', '長3度', 'M3'] },
  { number: 5, relations: ['4度', '完全4度', '11th'] },
  { number: 6, relations: ['減5度', '♭5'] },
  { number: 7, relations: ['5度', '完全5度'] },
  { number: 8, relations: ['短6度', '♭13th'] },
  { number: 9, relations: ['6度', '13th', '6th'] },
  { number: 10, relations: ['短7度', 'm7', '-7'] },
  { number: 11, relations: ['7度', 'M7', '△7'] },
  { number: 12, relations: ['8度'] },
];

// 全ての音のリスト
const allNotes = Object.keys(noteToNumber);

// 全ての関係のリスト（度数など）
const allRelations = relationMapping.flatMap(item => item.relations);

// 問題タイプの説明
const questionTypeInfo = {
  1: {
    title: "１：〇〇を数字で表すと？",
    description: "C=0、E=4、半音上がれば1増加"
  },
  2: {
    title: "２：〇〇の度数は何？",
    description: "Key=C（Cが1度）"
  },
  3: {
    title: "３：〇〇の〇〇は何？",
    description: "ある音の〇度"
  },
  4: {
    title: "４：〇から見て〇は何度？",
    description: "基準音からの距離＝二音の関係"
  },
  5: {
    title: "５：ランダム",
    description: "上記からランダムに出題"
  }
};

// 問題のタイプを定義
const questionTypes = [
  {
    type: 1,
    template: '{note}を数字で表すと？',
    generateQuestion: () => {
      const randomNote = allNotes[Math.floor(Math.random() * allNotes.length)];
      return {
        question: `${randomNote}を数字で表すと？`,
        answer: `${noteToNumber[randomNote]}`,
        explanation: `${randomNote}の数字は${noteToNumber[randomNote]}です。`
      };
    }
  },
  {
    type: 2,
    template: '{note}の度数は何？',
    generateQuestion: () => {
      const randomNote = allNotes[Math.floor(Math.random() * allNotes.length)];
      const number = noteToNumber[randomNote];
      const mod12 = number % 12;
      const relations = relationMapping.find(item => item.number === mod12).relations;
      return {
        question: `${randomNote}の度数は何？`,
        answer: relations.join('、'),
        explanation: `${randomNote}の度数は${relations.join('、')}です。`
      };
    }
  },
  {
    type: 3,
    template: '{note}の{relation}は何？',
    generateQuestion: () => {
      const randomNote = allNotes[Math.floor(Math.random() * allNotes.length)];
      const randomRelationObj = relationMapping[Math.floor(Math.random() * relationMapping.length)];
      const randomRelation = randomRelationObj.relations[Math.floor(Math.random() * randomRelationObj.relations.length)];
      
      const baseNumber = noteToNumber[randomNote];
      const relationNumber = randomRelationObj.number;
      const resultNumber = (baseNumber + relationNumber) % 12;
      
      const resultNotes = Array.isArray(numberToNote[resultNumber]) 
        ? numberToNote[resultNumber].join('、')
        : numberToNote[resultNumber];
      
      return {
        question: `${randomNote}の${randomRelation}は何？`,
        answer: resultNotes,
        explanation: `${randomNote}から${randomRelation}は${resultNotes}です。基準の音${randomNote}(${baseNumber})に${randomRelation}(${relationNumber})を足すと${baseNumber + relationNumber}となり、12で割った余り${resultNumber}の音${resultNotes}になります。`
      };
    }
  },
  {
    type: 4,
    template: '{note1}から見て{note2}は何？',
    generateQuestion: () => {
      const randomNote1 = allNotes[Math.floor(Math.random() * allNotes.length)];
      const randomNote2 = allNotes[Math.floor(Math.random() * allNotes.length)];
      
      const number1 = noteToNumber[randomNote1];
      const number2 = noteToNumber[randomNote2];
      
      // 必要に応じて1オクターブ上げる
      let diff = number2 - number1;
      if (diff < 0) diff += 12;
      
      const relations = relationMapping.find(item => item.number === diff).relations;
      
      return {
        question: `${randomNote1}から見て${randomNote2}は何度？`,
        answer: relations.join('、'),
        explanation: `${randomNote1}(${number1})から見て${randomNote2}(${number2})は${relations.join('、')}です。計算方法：${number2 >= number1 ? `${number2} - ${number1} = ${diff}` : `${number2} + 12 - ${number1} = ${diff}`}`
      };
    }
  }
];

// 回答チェック用の正規化関数
const normalizeAnswer = (answer) => {
  // 全角を半角に変換
  let normalized = answer.replace(/[Ａ-Ｚａ-ｚ０-９]/g, (s) => {
    return String.fromCharCode(s.charCodeAt(0) - 0xFEE0);
  });
  
  // 空白を削除
  normalized = normalized.replace(/\s+/g, '');
  
  return normalized;
};

// ♭とbの変換、#と＃の変換を行う関数
const convertNotation = (answer) => {
  // ♭をbに、♯を#に変換
  let converted = answer.replace(/♭/g, 'b').replace(/♯/g, '#');
  return converted;
};

// 回答比較関数
const compareAnswers = (userAnswer, correctAnswer) => {
  // 数字の場合の特別処理
  if (/^\d+$/.test(correctAnswer)) {
    return normalizeAnswer(userAnswer) === normalizeAnswer(correctAnswer);
  }
  
  // 複数の正解がある場合
  const correctAnswers = correctAnswer.split('、');
  
  // ユーザーの回答を正規化
  const normalizedUserAnswer = normalizeAnswer(userAnswer);
  const convertedUserAnswer = convertNotation(normalizedUserAnswer);
  
  // どれかの正解と一致するか確認
  return correctAnswers.some(answer => {
    const normalizedCorrectAnswer = normalizeAnswer(answer);
    const convertedCorrectAnswer = convertNotation(normalizedCorrectAnswer);
    
    return (
      convertedUserAnswer === convertedCorrectAnswer ||
      normalizedUserAnswer === normalizedCorrectAnswer
    );
  });
};

const MusicTheoryQuiz = () => {
  const [selectedQuestionType, setSelectedQuestionType] = React.useState(null);
  const [currentQuestion, setCurrentQuestion] = React.useState(null);
  const [userAnswer, setUserAnswer] = React.useState('');
  const [feedback, setFeedback] = React.useState('');
  const [showAnswer, setShowAnswer] = React.useState(false);
  const [score, setScore] = React.useState({ correct: 0, total: 0 });
  const [history, setHistory] = React.useState([]);
  const [isHome, setIsHome] = React.useState(true);
  
  // 問題を生成する関数
  const generateNewQuestion = () => {
    let questionType;
    
    if (selectedQuestionType === 5) {
      // ランダムに問題タイプを選択
      questionType = questionTypes[Math.floor(Math.random() * questionTypes.length)];
    } else {
      // 選択された問題タイプを使用
      questionType = questionTypes[selectedQuestionType - 1];
    }
    
    const newQuestion = questionType.generateQuestion();
    setCurrentQuestion(newQuestion);
    setUserAnswer('');
    setFeedback('');
    setShowAnswer(false);
  };
  
  // 問題タイプが選択されたときの処理
  const handleQuestionTypeSelect = (type) => {
    setSelectedQuestionType(type);
    setIsHome(false);
    setScore({ correct: 0, total: 0 });
    setHistory([]);
  };
  
  // 初回レンダリング時またはタイプ変更時に問題を生成
  React.useEffect(() => {
    if (selectedQuestionType && !isHome) {
      generateNewQuestion();
    }
  }, [selectedQuestionType, isHome]);
  
  // 回答をチェックする関数
  const checkAnswer = () => {
    const isCorrect = compareAnswers(userAnswer, currentQuestion.answer);
    
    setScore(prev => ({
      correct: isCorrect ? prev.correct + 1 : prev.correct,
      total: prev.total + 1
    }));
    
    setHistory(prev => [...prev, {
      question: currentQuestion.question,
      userAnswer,
      correctAnswer: currentQuestion.answer,
      isCorrect
    }]);
    
    if (isCorrect) {
      setFeedback('正解です！');
    } else {
      setFeedback(`不正解です。正解は「${currentQuestion.answer}」です。`);
    }
    
    setShowAnswer(true);
  };
  
  // Enterキーを押したときに回答チェック
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && userAnswer && !showAnswer) {
      checkAnswer();
    }
  };
  
  // ホーム画面に戻る
  const goHome = () => {
    setIsHome(true);
    setSelectedQuestionType(null);
  };
  
  // ホーム画面の表示
  if (isHome) {
    return (
      <div className="p-4 max-w-md mx-auto bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center mb-6">音楽理論クイズ</h1>
        <p className="text-center mb-6">問題のタイプを選択してください</p>
        
        <div className="space-y-4">
          {Object.entries(questionTypeInfo).map(([type, info]) => (
            <div key={type} className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer" onClick={() => handleQuestionTypeSelect(parseInt(type))}>
              <h2 className="text-lg font-medium">{info.title}</h2>
              <p className="text-sm text-gray-600">{info.description}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  // 問題画面の表示
  return (
    <div className="p-4 max-w-md mx-auto bg-white rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={goHome}
          className="bg-gray-200 hover:bg-gray-300 py-1 px-3 rounded"
        >
          ホームに戻る
        </button>
        <h1 className="text-xl font-bold text-center">{questionTypeInfo[selectedQuestionType].title}</h1>
        <div className="w-20"></div> {/* スペースのためのダミー要素 */}
      </div>
      
      <div className="mb-6 p-4 bg-gray-100 rounded-lg">
        <p className="text-lg font-medium mb-2">問題:</p>
        <p className="text-xl mb-4">{currentQuestion?.question}</p>
        
        <div className="mb-4">
          <input
            type="text"
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={showAnswer}
            placeholder="答えを入力してください"
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>
        
        {!showAnswer && (
          <button
            onClick={checkAnswer}
            disabled={!userAnswer}
            className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:bg-gray-400"
          >
            回答する
          </button>
        )}
        
        {showAnswer && (
          <div className="mt-4">
            <p className={`text-lg font-medium ${feedback.includes('正解') ? 'text-green-600' : 'text-red-600'}`}>
              {feedback}
            </p>
            <p className="mt-2">{currentQuestion?.explanation}</p>
            <button
              onClick={generateNewQuestion}
              className="w-full mt-4 bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600"
            >
              次の問題へ
            </button>
          </div>
        )}
      </div>
      
      <div className="mb-6">
        <p className="text-center text-lg">
          スコア: {score.correct}/{score.total} ({score.total > 0 ? Math.round((score.correct / score.total) * 100) : 0}%)
        </p>
      </div>
      
      {history.length > 0 && (
        <div>
          <h2 className="text-xl font-bold mb-2">履歴</h2>
          <div className="max-h-64 overflow-y-auto">
            {history.slice().reverse().map((item, index) => (
              <div key={index} className={`p-2 mb-2 rounded ${item.isCorrect ? 'bg-green-100' : 'bg-red-100'}`}>
                <p><strong>問題:</strong> {item.question}</p>
                <p><strong>あなたの回答:</strong> {item.userAnswer}</p>
                <p><strong>正解:</strong> {item.correctAnswer}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// アプリをレンダリング
ReactDOM.render(<MusicTheoryQuiz />, document.getElementById('root'));
