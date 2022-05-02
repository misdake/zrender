import { expect } from 'chai';
import { Collision2d, Linesegment2d, Point2d, Polygon2d } from '../engine/components/Collision';

describe('point_polygon_inside', function () {
    it('simple', function () {
        let point1 = new Point2d(0, 0);
        let point2 = new Point2d(2, 0);
        let polygon = new Polygon2d([new Point2d(1, -1), new Point2d(1, 1), new Point2d(-1, 1), new Point2d(-1, -1)]);
        let insideResults = Collision2d.inside(polygon, point1, point2);
        expect(insideResults.length).equal(1);
        expect(insideResults[0].shape1).equal(point1);
        expect(insideResults[0].shape2).equal(polygon);
    });
});

describe('linesegment_linesegment_test', function () {
    it('simple', function () {
        let line1 = new Linesegment2d(new Point2d(-1, 0), new Point2d(1, 0));
        let line2 = new Linesegment2d(new Point2d(0, -1), new Point2d(0, 1));
        let testResult = Collision2d.test(line1, line2);
        expect(testResult.length).equal(1);
        let point = testResult[0].point;
        expect(point.x).equal(0);
        expect(point.y).equal(0);
    });
});

describe('linesegment_polygon_test', function () {
    it('simple', function () {
        let line = new Linesegment2d(new Point2d(-2, 0), new Point2d(2, 0));
        let polygon = new Polygon2d([new Point2d(1, -1), new Point2d(1, 1), new Point2d(-1, 1), new Point2d(-1, -1)]);
        let testResult = Collision2d.test(line, polygon);
        expect(testResult.length).equal(2);
        testResult.sort((a, b) => a.point.x - b.point.x);
        let point1 = testResult[0].point;
        let point2 = testResult[1].point;
        expect(point1.x).equal(-1);
        expect(point1.y).equal(0);
        expect(point2.x).equal(1);
        expect(point2.y).equal(0);
    });
});
