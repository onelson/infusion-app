import { round, modes } from 'stround';

const EXOTIC = 6;
const LEGENDARY = 5;

function combinations (arr, k) {
  let i,
      subI,
      ret = [],
      sub,
      next;
  for(i = 0; i < arr.length; i++){
    if(k === 1) {
      ret.push([arr[i]]);
    }
    else {
      sub = combinations(arr.slice(i + 1, arr.length), k - 1);
      for (subI = 0; subI < sub.length; subI++) {
        next = sub[subI];
        next.unshift(arr[i]);
        ret.push(next);
      }
    }
  }
  return ret;
}

function permutate (low, high, mid) {
  return [[low, high]].push(...mid.map(x => combinations(mid, x))
          .map(x => [low].push(...x).push(high)));
}

export function infuse (item, other, exotic) {
  const diff = other - item;
  const [ comp, scale ] = (exotic) ? [ 4, 0.7 ] : [ 6, 0.8 ];

  if (diff <= comp) {
    return other.value;
  }
  return item + round(String(diff * scale), 0, modes.HALF_EVEN);
}

export function report (subject, bucket) {

  const walk = (items) => {
    const res = items
        .map(x => x.value)
        .reduce((x, y) => infuse(x, y, exotic=subject.tierType === EXOTIC));
    return { value: res, cost: items.length - 1, steps: items };
  };

  const items = bucket
      .filter((x) => x.value > subject.value)
      .sort((a, b) => a.value - b.value);

  const high = items.pop();

  const perms = permutate(subject, high, items);

  let bestValue = { value: 0, cost: Infinity, steps: [] };
  let bestMarks = { value: 0, cost: Infinity, steps: [] };

  perms.sort((a, b) => a[0].value - b[0].value).map(walk).forEach(result => {
    if (result.value > bestValue.value ||
        (result.value === bestValue.value && result.marks < bestValue.marks)) {
      bestValue = result;
    }

    if (result.marks < bestMarks.marks ||
        (result.marks === bestMarks.marks && result.value > bestMarks.value)) {
      bestMarks = result;
    }
  });

  return {
    bestValue,
    bestMarks
  };

}
