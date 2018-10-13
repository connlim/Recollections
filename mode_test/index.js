const data = [1, 2, 3, 5, 10, 11, 12];
let differences = [];
for(let i = 0; i < data.length - 1; i++){
  differences.push(data[i+1] - data[i]);
}
const difference_sum = differences.reduce((acc, val) => acc + val, 0);
const difference_mean = difference_sum / differences.length;
const difference_sd = Math.sqrt(differences.reduce((acc, val) => acc + Math.pow(val - difference_mean, 2), 0.0) / (differences.length - 1));
let groups = [[data[0]]];
let current_group = 0;
for(let i = 0; i < differences.length; i++){
  if(differences[i] < 3 * difference_sd) { //3 standard deviations threshold
    groups[current_group].push(data[i+1]);
  }else{
    current_group++;
    groups.push([data[i+1]]);
  }
}
console.log(groups);
