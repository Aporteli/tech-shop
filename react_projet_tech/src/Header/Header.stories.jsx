import Header from "./Header";

// 1. მთავარი კონფიგურაცია Storybook-ისთვის
export default {
  title: "Components/MyHeader", // როგორ გამოჩნდეს მარცხენა მენიუში
  component: Header,
};

// 2. კომპონენტის ვერსია (Story)
export const Default = () => (
  // ვამატებთ დიდ სიმაღლეს (div-ს), რომ Storybook-ში სქროლვა შეგვეძლოს
  // და ჰიდერის ანიმაციები გამოვცადოთ
  <div style={{ height: "2000px", paddingTop: "100px", background: "#f3f4f6" }}>
    <Header />
    <h2 style={{ textAlign: "center", marginTop: "50px" }}>
      დაასქროლე ქვემოთ ჰიდერის სატესტოდ...
    </h2>
  </div>
);
