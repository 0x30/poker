import { defineComponent } from "@vue/runtime-core";
import Header from "./Header";
import Footer from "./Footer";
import Container from "./Container";
import FixedMenu from "./FixedMenu";

export default defineComponent(() => {
  return () => {
    return (
      <div class="h-full w-full absolute content-between flex flex-col">
        <Header></Header>
        <Container class="flex-1"></Container>
        <Footer></Footer>
        <FixedMenu></FixedMenu>
      </div>
    );
  };
});
