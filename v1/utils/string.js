/**
 * a list of string related utilities
 * @type {{extend_or_replace: Function}}
 */
module.exports = {
    /**
     * 1) append str2 to str1 if both not null
     * 2) return str2 if str1 is null and str2 is not
     * 3) return null if both str1 and str2 are null
     * @param str1
     * @param str2
     * @returns (check above)
     */
    extend_or_replace: function (str1, str2) {
        if (!str1) {
            return str2;
        } else if (str2) {
            return (str1 + str2);
        } else {
            return null;
        }
    }
};