import { defineComponent } from "@vue/runtime-core";
import Header from "./Header";
import Footer from "./Footer";
import Container from "./Container";
import FixedMenu from "./FixedMenu";

export default defineComponent(() => {
  return () => {
    return (
      <div class="h-full w-full absolute flex flex-col">
        <Header></Header>
        <Container></Container>
        <Footer></Footer>
        <FixedMenu></FixedMenu>
      </div>
    );
  };
});
