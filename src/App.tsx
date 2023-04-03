import {useEffect, useRef, useState} from "react";
import "./App.css";
import {
  App as AntdApp,
  Button,
  Card,
  Cascader,
  Checkbox,
  Col, ConfigProvider, DatePicker,
  Divider, Drawer, FloatButton,
  Input,
  Layout, message, Modal, Progress,
  Radio,
  Row,
  Select, Slider,
  Space, Steps
} from "antd";
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
import locale from 'antd/locale/ru_RU';
import * as React from "react";
import {DownloadOutlined, GithubOutlined, InfoCircleOutlined} from "@ant-design/icons";
import {Content, Footer, Header} from "antd/es/layout/layout";

enum AppState {
  Register,
  Test,
}

export default function App() {
  const [state, setState] = useState(AppState.Test);
  const [user, setUser] = useState<User>();

  return (
    <div className="App">
      <ConfigProvider locale={locale}>
        {state === AppState.Register &&
          <Register onStartTest={user => {
            setUser(user);
            setState(AppState.Test);
          }}/>
        }
        {state === AppState.Test &&
          <Test user={user!} onComplete={() => {}}/>
        }
      </ConfigProvider>
    </div>
  );
}

interface User {
  name: string;
  sureName: string;
  gender: string;
  birthday: string;
  email: string;
  password: string;
}

function Register(props: {onStartTest: (user: User) => void}) {
  const [messageApi, contextHolder] = message.useMessage();

  const [name, setName] = useState<string>();
  const [sureName, setSureName] = useState<string>();
  const [gender, setGender] = useState<string>();
  const [birthday, setBirthday] = useState<string>();
  const [email, setEmail] = useState<string>();
  const [password, setPassword] = useState<string>();
  const [confirmPassword, setConfirmPassword] = useState<string>();

  const [allowProvisionPersonalData, setAllowProvisionPersonalData] = useState(false);

  function tryStartTest(): boolean {
    const fields = [name, sureName, gender, birthday, email, password, confirmPassword];
    for (let i = 0; i < fields.length; i++) {
      if ([undefined, null, ""].includes(fields[i])) {
        messageApi.open({type: "error", content: "Не все поля для регистрации заполнены"});
        return false;
      }
    }

    if (Number(birthday!.slice(0, 4)) > 2019) {
      messageApi.open({type: "error", content: "Ты слишком мал для этого теста"});
      return false;
    }
    if (email!.length < 5 || email!.indexOf("@") === -1) {
      messageApi.open({type: "error", content: "Электронная почта не валидна"});
      return false;
    }
    if (password!.length < 9) {
      messageApi.open({type: "error", content: "Слишком короткий пароль"});
      return false;
    }
    if (password !== confirmPassword) {
      messageApi.open({type: "error", content: "Пароль не подтверждён"});
      return false;
    }

    props.onStartTest({
      name: name!,
      sureName: sureName!,
      gender: gender!,
      birthday: birthday!,
      email: email!,
      password: password!,
    });
    return true;
  }

  return (
    <div className={"p-3 d-flex flex-column"}>
      {contextHolder}

      <h1 className={"text-center mb-3"}>Кототест!</h1>
      <Row gutter={[5, 7]}>
        <Col span={12}><Input placeholder="Имя"
                              onChange={({target: {value}}) => setName(value)}/></Col>
        <Col span={12}><Input placeholder="Фамилия"
                              onChange={({target: {value}}) => setSureName(value)}/></Col>
        <Col span={12}>
          <Select
            className={"w-100"}
            placeholder={"Пол"}
            onChange={value => setGender(value)}
            allowClear>

            <Select.Option value="male">🚹 муж</Select.Option>
            <Select.Option value="female">🚺 жен</Select.Option>
            <Select.Option value="other">🏳️‍🌈 би</Select.Option>
          </Select>
        </Col>
        <Col span={12}>
          <DatePicker
            className={"w-100"}
            onChange={e => setBirthday(e ? dayjs(e).format("YYYY-MM-DD") : "")}
            /*defaultValue={dayjs("2000-01-01", "YYYY-MM-DD")}*/
            placeholder={"дата рождения"}
          />
        </Col>
        <Col span={24}><Input
          placeholder="Почта" onChange={({target: {value}}) => setEmail(value)}/></Col>
        <Col span={12}><Input.Password
          placeholder="Пароль" onChange={({target: {value}}) => setPassword(value)}/></Col>
        <Col span={12}>
          <Input.Password
            placeholder="Подтвердить пароль"
            onChange={({target: {value}}) => setConfirmPassword(value)}
          />
        </Col>
      </Row>
      <Divider plain orientation={"left"}>Соглашение о предоставлении личных данных</Divider>
      <p className={"mb-0"}>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed nonne merninisti licere mihi ista
        probare, quae sunt a te dicta? Refert tamen, quo modo.
        Lorem ipsum dolor sit amet, consectetur adipisicing elit. Cumque, sequi?
        Lorem ipsum dolor sit amet, consectetur adipisicing elit. Assumenda dolorem explicabo nobis nostrum odio quia, ut vel veniam! A consectetur debitis iure nihil nostrum obcaecati quam quis recusandae repellendus sequi?
        {birthday}
      </p>
      <Checkbox
        className={"align-self-end"}
        onChange={e => setAllowProvisionPersonalData(e.target.checked)}>

        Согласен
      </Checkbox>
      <Divider/>
      <Button
        className={"align-self-stretch"}
        onClick={tryStartTest}
        type={"primary"}
        disabled={!allowProvisionPersonalData}>

        Начать тест
      </Button>
    </div>
  );
}

type Answer = number | string | null;
function Test(props: {
  user: User,
  /*questions: {name: string, description: string, questions: React.ReactNode[]}[],*/
  /*answers: {moduleIndex: number, text: string}[],*/
  onComplete: () => void,
}) {
  const oftenMarks = ["Никогда", "Редко", "Иногда", "Часто", "Всегда"];
  const modules: {name: string, description: string, questions: React.ReactNode[]}[] = [
    {name: "Общее", description: "", questions: [
        <Question
          text={"Какие привычки у вас есть перед сном?"}
          answers={[
            "Люблю почитать книгу",
            "Смотрю фильм или сериал",
            "Слушаю музыку или подкаст",
          ]}
          other
        />,
        <Question
          text={"Как вы любите проводить своё свободное время?"}
          answers={[
            "Активно, занимаюсь спортом или путешествую",
            "Смотрю телевизор или играю в компьютерные игры",
            "Читаю книги, слушаю музыку или занимаюсь рукоделием",
          ]}
          other
        />,
        <Question
          text={"Как вы относитесь к домашним животным?"}
          answers={[
            "Очень люблю и заботлюсь о них",
            "Не против, но не особо увлечен",
            "Не люблю, предпочитаю безжизненный интерьер",
          ]}
          other
        />,
        <Question
          text={"Как вы относитесь к погодным условиям?"}
          answers={[
            "Люблю тепло и солнце",
            "Нравится разнообразие погоды, каждая имеет свой шарм",
            "Предпочитаю прохладу и осеннюю погоду",
          ]}
          other
        />,
        <Question
          text={"Как вы любите питаться?"}
          answers={[
            "Люблю мясо и жирную пищу",
            "Питаюсь здоровой пищей, употребляю много овощей и фруктов",
            "Люблю сладкое и углеводы",
          ]}
          other
        />,
        <Question
          text={"Какие темы вас интересуют?"}
          answers={[
            "История и культура",
            "Наука и техника",
            "Искусство и красота",
          ]}
          other
        />,
        <Question
          text={"Как вы относитесь к различным видам спорта?"}
          answers={[
            "Люблю занятия спортом, активный образ жизни",
            "Не особо интересуюсь, но не против",
            "Спорт - это не для меня",
          ]}
          other
        />,
        <Question
          text={"Как вы выражаете свои эмоции?"}
          answers={[
            "Открыто и экспрессивно",
            "Сдержанно и умеренно",
            "Склонен к частым перепадам настроения",
          ]}
          other
        />,
        <Question
          text={"Как вы относитесь к порядку и чистоте?"}
          answers={[
            "Очень бережно отношусь к своим вещам и окружению",
            "Старайся держать все в порядке, но не особо строг",
            "Не обращаю на это особого внимания",
          ]}
          other
        />,
        <Question
          text={"Как вы проводите свой отпуск?"}
          answers={[
            "Люблю путешествовать и открывать для себя новые места",
            "Предпочитаю отдыхать дома, читать книги и смотреть фильмы",
            "Отдыхаю активно, занимаюсь спортом или учусь новому",
          ]}
          other
        />,
        <Question
          text={"Как вы относитесь к изменениям в жизни?"}
          answers={[
            "Люблю новые впечатления и не боюсь перемен",
            "Немного беспокоюсь, но готов принимать вызовы",
            "Очень не люблю изменения и стараюсь их избегать",
          ]}
          other
        />,
      ]},
    {name: "Сны", description: "", questions: [
        <QuestionSlider
          text={"Бывает ли у вас чувство полёта во время сна?"}
          marks={oftenMarks}
        />,
        <QuestionSlider
          text={"Часто ли вы видите во сне реалистичные сцены из своей жизни?"}
          marks={oftenMarks}
        />,
        <QuestionSlider
          text={"У вас бывают кошмары, которые могут вызвать страх или тревогу?"}
          marks={oftenMarks}
        />,
        <QuestionSlider
          text={"Бывает ли у вас ощущение, что вы знаете, что сейчас спите и видите сон?"}
          marks={oftenMarks}
        />,
        <QuestionSlider
          text={"Вы видите сны, которые потом сбываются в реальности?"}
          marks={oftenMarks}
        />,
      ]},
    {name: "Видения", description: "", questions: [
        <Question
          text={"Какова ваша любимая игра?"}
          answers={["__ 0 __", "__ 1 __", "__ 2 __"]}
        />,
        <Question
          text={"Что вы делаете, когда вы скучаете?"}
          answers={["|__ 0 __|", "__ 1 __", "__ 2 __"]}
        />,
        <Question
          text={"Как вы обычно спите?"}
          answers={["__ 0 __", "kek))", "__ 2 __"]}
        />,
      ]},
    {name: "IQ", description: "", questions: [
        <Question
          text={"Как вы общаетесь с другими людьми или животными?"}
          answers={["__ 0 __", "__ 1 __", "__ 2 __"]}
        />,
        <Question
          text={"Какой ваш любимый цвет?"}
          answers={["|__ 0 __|", "__ 1 __", "__ 2 __"]}
        />,
        <Question
          text={"Вы любите молоко?"}
          answers={["__ 0 __", "kek))", "__ 2 __"]}
        />,
      ]},
    {name: "Визуализация", description: "", questions: [
        <Question
          text={"Lorem ipsum dolor sit amet, consectetur adipisicing elit. Eos, molestias?"}
          answers={["__ 0 __", "__ 1 __", "__ 2 __"]}
        />,
        <Question
          text={"Lorem ipsum dolor sit amet, consectetur adipisicing elit. Eos, molestias (1)?"}
          answers={["|__ 0 __|", "__ 1 __", "__ 2 __"]}
        />,
        <Question
          text={"Lorem ip sit ampisicing elit. Eos, molestias (2)?"}
          answers={["__ 0 __", "kek))", "__ 2 __"]}
        />,
      ]},
  ];

  const [currentModuleIndex, setCurrentModuleIndex] = useState(1);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  /*const [currentAnswer, setCurrentAnswer] = useState<Answer>(null);*/

  const [questionsCount, setQuestionsCount] = useState(0);
  const [completedQuestionsCount, setCompletedQuestionsCount] = useState(0);

  const [answers, setAnswers] = useState<{moduleIndex: number, value: Answer}[]>([]);

  const [openInfo, setOpenInfo] = useState(false);

  useEffect(() => {
    modules.forEach(module => setQuestionsCount(prev => prev + module.questions.length));
  }, []);

  useEffect(() => {
    setCurrentQuestionIndex(0);
  }, [currentModuleIndex]);

  function completeQuestion(answer: Answer) {
    setAnswers([...answers, {moduleIndex: currentModuleIndex, value: answer}]);
    setCompletedQuestionsCount(completedQuestionsCount + 1);

    if (modules[currentModuleIndex].questions.length > currentQuestionIndex + 1)
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    else if (modules.length > currentModuleIndex + 1)
      setCurrentModuleIndex(currentModuleIndex + 1);
    else
      alert("Complete!!!");
  }

  function Question(props: {
    text: string,
    answers: string[],
    other?: boolean,
  }) {
    const [selectedAnswerIndex, setSelectedAnswerIndex] = useState<number | null>(null);

    return (
      <Space direction={"vertical"} size={15}>
        <h3>{props.text}</h3>
        <Radio.Group
          onChange={({target: {value}}) => setSelectedAnswerIndex(value)}
          value={selectedAnswerIndex}>

          <Space direction="vertical">
            {(props.other ? [...props.answers, "Другой вариант"] : props.answers)
              .map((answer, i) => <Radio key={answer} value={i}>{answer}</Radio>)}
          </Space>
        </Radio.Group>
        <Button
          onClick={() => completeQuestion(props.answers[selectedAnswerIndex!])}
          disabled={selectedAnswerIndex === null}>

          Далее
        </Button>
      </Space>
    );
  }

  function QuestionSlider(props: {text: string, marks: string[]}) {
    const [answer, setAnswer] = useState<number>(50);

    return (
      <Space direction={"vertical"} size={15}>
        <h3>{props.text}</h3>
        <Slider
          className={"mx-4"}
          value={answer}
          onChange={setAnswer}
          marks={/*{0: "lol", 100: "kek"}*/Object.fromEntries(
            props.marks.map((mark, i) => [i / (props.marks.length - 1) * 100, mark])
          )}
          included={false}
          /*defaultValue={50}*/
          tooltip={{formatter: null}}
        />
        <Button
          onClick={() => completeQuestion(answer)}>

          Далее
        </Button>
      </Space>
    );
  }

  return (
    <Space className={"w-100 p-3"} direction={"vertical"}>
      <Progress percent={completedQuestionsCount / questionsCount * 100} showInfo={false}/>

      {modules[currentModuleIndex].questions[currentQuestionIndex]}

      <FloatButton onClick={() => setOpenInfo(true)} type="default"
                   shape="circle" icon={<InfoCircleOutlined/>}/>
      <Drawer
        className={""}
        title="Информация"
        /*placement={"right"}*/
        closable={false}
        onClose={() => setOpenInfo(false)}
        open={openInfo}
      >
        <Steps
          direction="vertical"
          size={"small"}
          current={currentModuleIndex}
          percent={currentQuestionIndex / modules[currentModuleIndex].questions.length * 100}
          items={modules.map(module => ({
            title: module.name, description: module.description
          }))}
        />


        {/*<Button shape="circle" icon={<GithubOutlined style={{fontSize: 20}}/>}/>*/}
        <GithubOutlined style={{fontSize: 20}}/>
      </Drawer>
    </Space>
  );
}