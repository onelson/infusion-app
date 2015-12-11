import { round, modes } from 'stround';

const COST = 3;
const EXOTIC = 6;

function k_combinations (set, k) {
  var i, j, combs, head, tailcombs;

  if (k > set.length || k <= 0) {
    return [];
  }

  if (k === set.length) {
    return [set];
  }

  if (k === 1) {
    combs = [];
    for (i = 0; i < set.length; i++) {
      combs.push([set[i]]);
    }
    return combs;
  }

  combs = [];
  for (i = 0; i < set.length - k + 1; i++) {
    head = set.slice(i, i + 1);
    tailcombs = k_combinations(set.slice(i + 1), k - 1);
    for (j = 0; j < tailcombs.length; j++) {
      combs.push(head.concat(tailcombs[j]));
    }
  }
  return combs;
}

function combinations (set) {
  var k, i, combs, k_combs;
  combs = [];
  for (k = 1; k <= set.length; k++) {
    k_combs = k_combinations(set, k);
    for (i = 0; i < k_combs.length; i++) {
      combs.push(k_combs[i]);
    }
  }
  return combs;
}

function calculateSteps (low, high, mid) {
  const middles = mid.map(x => combinations(mid, x));
  return [[low, high]]
      .concat(middles.map(x => [low].concat(...x).concat(high)));
}

export function infuse (baseValue, targetValue, exotic) {
  const diff = targetValue - baseValue;
  const [ comp, scale ] = exotic ? [ 4, 0.7 ] : [ 6, 0.8 ];

  if (diff <= comp) {
    return targetValue;
  }
  return baseValue + parseInt(round(String(diff * scale), 0, modes.HALF_EVEN), 10);
}

export function report (subject, others) {

  let bestValue = { value: 0, cost: Infinity, steps: [] };
  let bestCost = { value: 0, cost: Infinity, steps: [] };

  const walk = (steps) => {
    const value = steps
        .map(x => x.value)
        .reduce((x, y) => infuse(x, y, subject.tierType === EXOTIC));
    return { value, steps, cost: (steps.length - 1) * COST };
  };

  const items = others.filter(x => x.value > subject.value).sort((a, b) => a.value - b.value);
  const high = items.pop();
  calculateSteps(subject, high, items)
      .sort((a, b) => a[0].value - b[0].value).map(walk).forEach(result => {
    if (result.value > bestValue.value ||
        (result.value === bestValue.value && result.marks < bestValue.marks)) {
      bestValue = result;
    }

    if (result.marks < bestCost.marks ||
        (result.marks === bestCost.marks && result.value > bestCost.value)) {
      bestCost = result;
    }
  });

  return {
    bestValue,
    bestCost
  };

}
