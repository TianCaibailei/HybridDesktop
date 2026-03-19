// Polyfills for .NET Framework 4.8 compatibility
// This file provides types that exist in .NET 5+ but not in .NET Framework 4.8.
// It is conditionally compiled only when targeting .NET Framework.

#if NETFRAMEWORK

using System.Collections.Generic;
using System.Runtime.CompilerServices;

namespace System.Collections.Generic
{
    /// <summary>
    /// Polyfill for System.Collections.Generic.ReferenceEqualityComparer (available in .NET 5+).
    /// Compares objects by reference identity rather than by value equality.
    /// </summary>
    internal sealed class ReferenceEqualityComparer : IEqualityComparer<object>
    {
        public static ReferenceEqualityComparer Instance { get; } = new ReferenceEqualityComparer();

        private ReferenceEqualityComparer() { }

        public new bool Equals(object x, object y) => ReferenceEquals(x, y);

        public int GetHashCode(object obj) => RuntimeHelpers.GetHashCode(obj);
    }
}

#endif
