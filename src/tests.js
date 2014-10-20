var tests = {
	neighborsLength: function(){
		var map = new Map(5,5,[],{});
		return (map.getNeighbors(0,0).length == 9 && map.getNeighbors(4,4).length == 9);
	},
	validDirections: function(){
		var map = new Map(5,5,[],{});
		return (_.difference(map.getValidDirections(0,0), [Dirs.R, Dirs.DR, Dirs.C, Dirs.D]).length == 0);
	}
}

for (test in tests){
	if (!tests[test]()){
		var e = new Error(test + " failed");
		throw e;
	}
}