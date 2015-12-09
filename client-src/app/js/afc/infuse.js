
function permutate (low, high, mid) {
  const res = [[low, high]];

  // TODO
  return res;
}

function infuse (item, other) {}

function walk (items) {
  const res = items.reduce((x, y) => infuse(x, y));
  return { value: res, cost: items.length - 1, steps: items };
}

export function report (subject, bucket) {
  const items = bucket
      .filter((x) => x.value > subject.value)
      .sort((a, b) => a.value - b.value);

  const high = items.pop();

  const perms = permutate(subject, high, items);

  const bestValue = { value: 0, cost: Infinity, steps: [] };
  const bestMarks = { value: 0, cost: Infinity, steps: [] };

  perms.sort((a, b) => a[0].value - b[0].value).map(walk).forEach(result => {
    // mutate "bests"
  });

}
