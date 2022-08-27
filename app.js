"use strict";

const btnOptions = document.querySelector(".btn--dots");
const btnChangeTheme = document.querySelector(".options__btn--theme");
const btnSwitchUser = document.querySelector(".options__btn--switch");
const btnClear = document.querySelector(".options__btn--clear");
const btnSubmitChat = document.querySelector(".chat__btn");
const btnThemeDefault = document.querySelector(".theme--default");
const btnThemeLight = document.querySelector(".theme--light");
const btnThemeDark = document.querySelector(".theme--dark");
const btnYes = document.querySelector(".btn--yes");
const btnNo = document.querySelector(".btn--no");

const containerPopup = document.querySelector(".popup");
const containerTextChat = document.getElementsByClassName("chat__text-box");
const containerChat = document.querySelector(".chat__box");
const containerOptions = document.querySelector(".chat__options");
const containerPhone = document.querySelector(".phone");
const containerThemes = document.querySelector(".options__themes-box");
const containerBlur = document.querySelector(".filter--blur");

const formChat = document.querySelector(".form");

const textChat = document.getElementsByClassName("chat__text");
const textChatLeft = document.getElementsByClassName("chat__text--left");
const textChatRight = document.getElementsByClassName("chat__text--right");
const textPopup = document.querySelector(".popup__text");

const inputMsg = document.querySelector(".chat__input");

const spinnerChat = document.querySelector(".chat__options .spinner");
const spinnerPopup = document.querySelector(".popup .spinner");

const msgChat = document.querySelector(".chat__options .msg");
const msgPopup = document.querySelector(".popup .msg");

// LENGTH BEFORE BREAK IS 85

class App {
  #messages = [];
  #sender = "user";
  #currTheme = "default-theme";
  #successMsgRendered = false;
  #closeOpt = true;
  #closePop = true;

  constructor() {
    this.#init();

    containerPhone.addEventListener("click", this.#closeThemes.bind(this));
    containerPhone.addEventListener("click", this.#closeOptions.bind(this));
    containerPhone.addEventListener("click", this.#closePopup.bind(this));

    formChat.addEventListener("submit", this.#submitChat.bind(this));

    inputMsg.addEventListener("input", this.#updateInputString.bind(this, 10));

    textPopup.addEventListener(
      "animationend",
      this.#renderSpinner.bind(this, spinnerPopup)
    );

    btnNo.addEventListener("click", this.#closePopup.bind(this));
    btnYes.addEventListener("click", this.#clearMessage.bind(this));
    btnOptions.addEventListener("click", this.#toggleOptions.bind(this));
    btnSwitchUser.addEventListener("click", this.#switchUser.bind(this));
    btnSwitchUser.addEventListener(
      "animationend",
      this.#renderSpinner.bind(this, spinnerChat)
    );
    btnClear.addEventListener("click", this.#renderPopup.bind(this));
    btnChangeTheme.addEventListener("click", this.#ToggleThemes.bind(this));
    [btnThemeLight, btnThemeDark, btnThemeDefault].forEach((theme) => {
      theme.addEventListener("mouseenter", this.#switchTheme.bind(this));
      theme.addEventListener("mouseleave", this.#switchTheme.bind(this));
      theme.addEventListener("click", this.#switchTheme.bind(this));
    });
  }

  #submitChat() {
    this.#renderMsg(new Message(" ", this.#sender));
  }
  #renderMsg(msg) {
    const message = msg;
    console.log(msg, Boolean(inputMsg.value));
    if (inputMsg.value) message.content = inputMsg.value;

    console.log(message);

    const html = `           
    <div class="chat__text-box chat__text-box--${
      message.sender === "user" ? "right" : "left"
    } chat__text-box--active">
        <p class="chat__text">
            ${message.content}
        </p>
    </div>
    `;
    containerChat.insertAdjacentHTML("beforeend", html);

    this.#scrollToMsg();

    inputMsg.value = "";

    // SAVE MESSAGE TO MESSAGES
    this.#saveMsg(message);

    // SAVE TO LOCAL STORAGE
    this.#setLocaleStorage();
  }

  #switchTheme(e) {
    document.body.classList.toggle(this.#currTheme);

    if (e?.target) {
      document.body.classList.toggle(
        `${e.target.closest(".theme").dataset.theme}-theme`
      );
    }

    if (e?.type === "click") {
      document.body.classList.remove(this.#currTheme);
      this.#currTheme = `${e.target.closest(".theme").dataset.theme}-theme`;
      document.body.classList.add(this.#currTheme);
      this.#setLocaleStorage();
      return;
    }
  }

  #switchUser() {
    this.#animateOptions("moveToRight", 0.8, 0.2, "forwards", "hidden");

    inputMsg.disabled = true;
    this.#closeOpt = false;

    if (this.#sender === "user") this.#sender = "walker";
    else this.#sender = "user";

    setTimeout(this.#hideSpinner.bind(this, spinnerChat), 2000); //begin counting before
    // Since can't access private methods from inside a callback function
    setTimeout(
      this.#renderSuccessMsg.bind(
        this,
        msgChat,
        `User has been Successfully Switched👍<br>You are now The<br><span>"${
          this.#sender
        }"</span>`
      ),
      3000
    );
  }

  #animateOptions(
    animName,
    animDuration,
    animDelay,
    animFillState,
    visibility
  ) {
    btnSwitchUser.style.animation = `${animName} ${animDuration}s ${animFillState}`;
    btnChangeTheme.style.animation = `${animName} ${animDuration}s ${animDelay}s ${animFillState}`;
    btnClear.style.animation = `${animName} ${animDuration}s ${
      animDelay + 0.2
    }s ${animFillState}`;

    setTimeout(() => {
      btnSwitchUser.style.visibility = visibility;
      btnChangeTheme.style.visibility = visibility;
      btnClear.style.visibility = visibility;
    }, 800);
  }

  #renderSpinner(spinner) {
    switch (spinner) {
      case spinnerChat: {
        if (btnSwitchUser.style.animationName !== "moveToRight") return;
        break;
      }
      case spinnerPopup: {
        if (textPopup.style.animationName !== "moveToRight") return;
        break;
      }
    }
    spinner.style.display = "block";
    setTimeout(
      () => (spinner.style.transform = "translate(-50%, -50%) scale(1)"),
      0
    );
  }
  #hideSpinner(spinner) {
    spinner.style.transform = "translate(-50%, -50%) scale(0)";
    setTimeout(() => (spinner.style.display = "none"), 800);
  }
  #renderSuccessMsg(msgEl, HTMLcontent) {
    msgEl.innerHTML = HTMLcontent;
    msgEl.style.display = "block";
    setTimeout(
      () => (msgEl.style.transform = "translate(-50%,-50%) scale(1)"),
      100
    );
    switch (msgEl) {
      case msgChat: {
        this.#closeOpt = true;
        this.#successMsgRendered = true;
        break;
      }
      case msgPopup: {
        this.#closePop = true;
        this.#successMsgRendered = true;
      }
    }
  }

  #hideSuccessMsg(msgEl) {
    msgEl.style.transform = "translate(-50%,-50%) scale(0)";
    setTimeout(() => (msgEl.style.display = "none"), 800);

    switch (msgEl) {
      case msgChat: {
        this.#closeOpt = true;
        this.#successMsgRendered = true;
        break;
      }
      case msgPopup: {
        this.#closePop = true;
        this.#successMsgRendered = true;
      }
    }
    inputMsg.disabled = false;
  }

  #renderPopup() {
    containerPopup.style.transform = "translate(-50%, -50%) scale(1)";
    containerBlur.classList.remove("u-transform-scale-down");

    this.#closeOptions();
  }
  #closePopup(e) {
    if (!this.#closePop) return;
    if (e.target === btnYes || e.target === btnClear) return;
    containerPopup.style.transform = "translate(-50%, -50%) scale(0)";
    containerBlur.classList.add("u-transform-scale-down");

    if (this.#successMsgRendered) this.#hideSuccessMsg(msgPopup);
    if (textPopup.style.animationName !== "moveToRight") return;
    textPopup.style.animation = "moveToLeft 0.4s forwards";
    btnYes.style.animation = "moveToLeft 0.4s forwards";
    btnNo.style.animation = "moveToLeft 0.4s forwards";

    if (e.target === btnNo) return;
    location.reload();
  }
  //   FONT OF STRING SHOULD BE MONOSPACE
  #breakString(str, fontSize) {
    let string = str;
    const baseFontSize = 10; //10px
    const baseStrLength = 26; //26 Characters

    //Return Break Length
    const calcBreakLength = (fontSize) =>
      Math.floor((baseStrLength / baseFontSize) * fontSize);

    if (string.length % calcBreakLength(fontSize) === 0) {
      const index =
        string.lastIndexOf(" ") !== -1
          ? string.lastIndexOf(" ")
          : string.length - 1;

      string = string.slice(0, index) + "\n" + string.slice(index + 1);
    }

    return string;
  }
  #updateInputString(fontSize) {
    inputMsg.value = this.#breakString(inputMsg.value, fontSize);
  }

  #scrollToMsg() {
    containerChat.scrollTo({
      top: 10000000000,
      left: 0,
      behavior: "smooth",
    });
  }

  #toggleOptions() {
    containerOptions.classList.toggle("u-transform-scale-down");
  }
  #closeOptions(e) {
    if (!this.#closeOpt) return;
    if (e?.target.closest(".chat__options") || e?.target.closest(".btn--dots"))
      return;
    containerOptions.classList.add("u-transform-scale-down");
    if (!this.#successMsgRendered) return;
    this.#hideSuccessMsg(msgChat);
    if (!btnSwitchUser.style.animation) return;
    this.#animateOptions("moveToLeft", 0.8, 0.2, "backwards", "visible");
  }
  #ToggleThemes(e) {
    if (containerThemes.classList.contains("u-display-none"))
      this.#openThemes();
    else this.#closeThemes(e);
  }

  #openThemes() {
    containerThemes.classList.remove("u-display-none");
    btnChangeTheme.classList.add("options__btn--active");

    setTimeout(() => {
      containerThemes.style.transform = `translate(-50%,-50%) scale(1)`;
    }, 0);
  }
  #closeThemes(e) {
    if (e.target === document.querySelector(".options__btn--theme")) return;
    btnChangeTheme.classList.remove("options__btn--active");

    containerThemes.style.transform = `translate(-50%,-50%) scale(0)`;

    setTimeout(() => {
      containerThemes.classList.add("u-display-none");
    }, 100);
  }
  #saveMsg(msg) {
    this.#messages.push(msg);
  }

  #setLocaleStorage() {
    console.log(this.#sender, this.#currTheme);
    localStorage.setItem("messages", JSON.stringify(this.#messages));
    localStorage.setItem("currTheme", this.#currTheme);
    localStorage.setItem("sender", this.#sender);
  }

  #getLocaleStorage() {
    return JSON.parse(localStorage.getItem("messages"));
  }

  #init() {
    const data = this.#getLocaleStorage();

    // INIT THEME
    this.#currTheme = localStorage.getItem("currTheme");
    this.#switchTheme();
    // INIT USER
    this.#sender = localStorage.getItem("sender");
    // INIT MESSAGES
    if (!data) return;
    data.forEach((msg) => this.#renderMsg(msg));

    setTimeout(
      () =>
        containerTextChat[containerTextChat.length - 1].scrollIntoView({
          behavior: "smooth",
          block: "nearest",
        }),
      100
    );
  }

  #clearMessage() {
    this.#closePop = false;

    textPopup.style.animation = "moveToRight 0.6s forwards";
    btnYes.style.animation = "moveToRight 0.6s forwards";
    btnNo.style.animation = "moveToRight 0.6s forwards";

    setTimeout(this.#hideSpinner.bind(this, spinnerPopup), 2000);
    setTimeout(
      this.#renderSuccessMsg.bind(
        this,
        msgPopup,
        `All Your Messages has been Cleared successfully👍`
      ),
      3000
    );
    localStorage.removeItem("messages");
  }
}

class Message {
  constructor(content, sender) {
    this.content = content;
    this.sender = sender;
  }
}

const app = new App();
