using System.Security.Cryptography;
using System.Text.RegularExpressions;

namespace BurgerCravvy.Domain.Common;

/// <summary>
/// Códigos de pedido con formato <c>BC-yyMMdd-XXXXXX</c>. El sufijo usa un alfabeto sin
/// caracteres confusos (I, L, O, 0, 1): 31^6 ≈ 887 millones de combinaciones por día.
/// </summary>
public static partial class OrderCode
{
    private const string Alphabet = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
    public const int SuffixLength = 6;

    public static string Generate(DateTime utcNow)
    {
        Span<char> suffix = stackalloc char[SuffixLength];
        for (var i = 0; i < SuffixLength; i++)
            suffix[i] = Alphabet[RandomNumberGenerator.GetInt32(Alphabet.Length)];
        return $"BC-{utcNow:yyMMdd}-{suffix}";
    }

    public static bool IsValid(string? code) => code is not null && Format().IsMatch(code);

    [GeneratedRegex("^BC-[0-9]{6}-[A-HJKMNP-Z2-9]{6}$")]
    private static partial Regex Format();
}
