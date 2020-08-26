function wait(ms = 0) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function destroyPopup(popup) {
  popup.classList.remove('open');
  await wait(1000);
  // remove it from the DOM
  popup.remove();
  // remove it from the js memory
  popup = null;
}

function ask(options) {
  // options object will have an attr with a question, and the option for a cancel button
  return new Promise(async function(resolve) {
    // 1st we need to create a popup with all the fields in it

    const popup = document.createElement('form');
    popup.classList.add('popup');
    popup.insertAdjacentHTML('afterbegin', `
      <fieldset>
        <label>${options.title}</label>
        <input type="text" name="input" />
        <button type="submit">Submit</button>
      </fieldset>
    `);
    console.log(popup);

    // 2nd check if they want a cancel button
    if(options.cancel) {
      const skipButton = document.createElement('button');
      skipButton.type = 'button'; // so it doesn't submit
      skipButton.textContent = 'Cancel';
      console.log(popup.firstChild);
      popup.firstElementChild.appendChild(skipButton);
      // TODO: listen for a click on that cancel button
      skipButton.addEventListener('click', () => {
        resolve(null);
        destroyPopup(popup);
      },
      { once: true})
    }

    // listen for the submit event on the inputs
    popup.addEventListener('submit', (e) => {
      e.preventDefault();
      // console.log('submit');
      resolve(e.target.input.value);// or this popup.input.value;

    },
    { once: true}
  );

    // when someone does submit it, resolve the data tht was in the input box
    // insert tht popup in the  DOM
    document.body.appendChild(popup);

    //put a very small titmeout before we add the open class
    await wait(50);
    popup.classList.add('open');
  });
}

async function askQuestion(e) {
  const button = e.currentTarget;
  const cancel = 'cancel' in button.dataset;
  console.log(cancel);
  // const cancel = button.hasAttribute('[data-cancel]')
  const answer = await ask({
    title: button.dataset.question,
    cancel,
  });
  console.log(answer);

}

const buttons = document.querySelectorAll('[data-question]');
buttons.forEach(button => button.addEventListener('click', askQuestion))

const questions = [
  {title: 'What is your name?'},
  {title: 'What is your age?', cancel: true},
  {title: 'What is your dogs name?'}
];

// async function askMany() {
//   for (const question of questions) {
//     const answer = await ask(question);
//     console.log(answer);
//   }
// }

async function asyncMap(array, callback) {
  const results = [];
  for (const item of array) {
    results.push(await callback(item));
  }
  return results;
}

async function go() {
  const answers = await asyncMap(questions, ask);
  console.log(answers);
}

go();
