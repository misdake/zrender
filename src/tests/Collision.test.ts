import { expect } from 'chai';
import { Collision2d, Linesegment2d, Point2d } from '../engine/components/Collision';

describe('calculate', function() {
    it('add', function() {
        let line1 = new Linesegment2d(new Point2d(-1, 0), new Point2d(1, 0));
        let line2 = new Linesegment2d(new Point2d(0, -1), new Point2d(0, 1));
        let testResult = Collision2d.test(line1, line2);
        expect(testResult.collisions.length).equal(1);
    });
});
