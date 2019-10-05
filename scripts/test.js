const all = [1,2,3,4,5,6]
let i = 4;
[0,1,2,3].forEach(i => 
{
    let cur = all.splice(0, Math.ceil(all.length / (4-i)));
    --i;
    console.log(cur, all)
});