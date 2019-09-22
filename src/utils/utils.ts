export const getColor = (r: number, g: number, b: number) => [ (1 / 255) * r, (1 / 255) * g, (1 / 255) * b ];

export const stringFormat = function(str: string, ..._: any[]) {
    if (arguments.length) {
        var t = typeof arguments[1];
        var key;
        var args = ("string" === t || "number" === t) ?
            Array.prototype.slice.call(arguments)
			: arguments[1];

        for (key in args) {
            str = str.replace(new RegExp("\\{" + key + "\\}", "gi"), args[key]);
        }
    }

    return str;
};