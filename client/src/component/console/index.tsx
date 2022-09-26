import { useState } from 'react';
import { Button } from 'antd';
import { Hook, Console as BaseConsole, Unhook } from 'console-feed';
interface IProps {
  code: string;
}
const Console = ({ code }: IProps) => {
  const [logs, setLogs] = useState([]);
  // 代码执行方法
  const run = () => {
    // 改写console中的各个打印方法把结果打印内容存到logs变量中
    Hook(
      window.console,
      // @ts-ignore
      (log) => setLogs((currLogs) => [...currLogs, log]),
      false,
    );
    // 使用eval执行把code做为代码执行
    eval(code);

    // 执行完毕后，把console的方法改回来
    // @ts-ignore
    Unhook(window.console);
  };
  return (
    <div>
      <Button onClick={run}>run</Button>
      <BaseConsole logs={logs} />
    </div>
  );
};

export default Console;
