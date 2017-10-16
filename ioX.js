// @flow

/*::
  type Action = string;
  type IO = { io: Action, then: Function }
  type Actions = { [Action]: (IO) => any }
*/

function isIO(value /*: IO | mixed */) {
  return Boolean(
    value != null &&
      typeof value === 'object' &&
      typeof value.io === 'string' &&
      (!value.then || typeof value.then === 'function')
  );
}

function identity(x) {
  return x;
}

async function run(actions /*:Actions*/, value /*:IO*/) {
  while (true) {
    value = await value;
    if (!isIO(value)) return value;

    const io /*:IO*/ = value;

    // Execute io.action
    const action = actions[io.io];
    if (action == null) throw new Error('Unknown io action: ' + value.io);
    const next = action(io);

    // Call io.then with the result.
    const then = io.then || identity;
    value = then(await next);
  }
}

module.exports.run = run;

const flatten = originalPromise => {
  return new Promise((resolve, reject) => {
    const recur = p => {
      if (v instanceof Promise) {
        v.then(recur);
      } else {
        resolve(v);
      }
    };

    recur(originalPromise);
  });
};

// module.exports.flatten = flatten;
