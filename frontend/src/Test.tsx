import React from 'react';

export default function Test() {
  return (
    <div style={{ padding: '20px', backgroundColor: 'lightblue', color: 'black' }}>
      <h1>Test Component - Nếu bạn thấy text này thì React đang hoạt động!</h1>
      <p>Thời gian hiện tại: {new Date().toLocaleString()}</p>
      <button onClick={() => alert('Button hoạt động!')}>Click me!</button>
    </div>
  );
}
