function getParameterDefinitions() {
  return [
    { name: 'arm1_a', type: 'float', initial:  0, caption: "arm1 rotate:", min: -360, max: 360, step: 2 },
    { name: 'arm2_a', type: 'float', initial:  0, caption: "arm2 rotate:", min: -360, max: 360, step: 2 },
    { name: 'arm1_l', type: 'float', initial: 10, caption: "arm1 lenght:", min: 1,    max: 20, step: 1 },
    { name: 'arm2_l', type: 'float', initial: 10, caption: "arm2 length:", min: 1,    max: 20, step: 1 },
  ];
}

function armFactory(len, col) {
    var arm = color(col, cube({size: [1,2,len], center:[true,true,false]}));
    // connector args are: connection point, shaft direction, shaft zero orientation
    arm.properties.beg = new CSG.Connector([-0.5, 0,     1], [1, 0, 0], [0, 0, 1]);
    arm.properties.end = new CSG.Connector([ 0.5, 0, len-1], [1, 0, 0], [0, 0, 1]);
    return arm;
}

function connectTo(beg, end, angle, mirror = false) {
    var matrix = beg.properties.beg.getTransformationTo(
      end.properties.end,
      mirror,   // mirror
      angle    // normalrotation
    );
    return beg.transform(matrix);
}

function main(params) {
    var {arm1_l,arm1_a,arm2_l,arm2_a} = params;

    // create arms with connectors at each end, arm0 is the base plate
    var arm0 = armFactory(4, 'black');
    var arm1 = armFactory(arm1_l, 'blue');
    var arm1a = armFactory(5, 'green');
    var arm1b = armFactory(arm1_l, 'lightblue');
    var arm2 = armFactory(arm2_l, 'red');

    // connect the arms at the given angle
    arm1 = connectTo(arm1, arm0, arm1_a);
    arm1a = connectTo(arm1a, arm0, 90+arm2_a);
    arm1b = connectTo(arm1b, arm1a, 270+arm1_a-arm2_a, true);
    arm2 = connectTo(arm2, arm1b, -270+arm1_a-arm2_a);

    return [
        arm0,
        arm1,
        arm1a,
        arm1b,
        arm2,
    ];
}
