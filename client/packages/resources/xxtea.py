# ##########################################################
#                                                          #  
# The implementation of PHPRPC Protocol 3.0                #  
#                                                          #  
# xxtea.py                                                 #  
#                                                          #  
# Release 3.0.0                                            #  
# Copyright (c) 2005-2008 by Team-PHPRPC                   #  
#                                                          #  
# WebSite:  http://www.phprpc.org/                         #  
#           http://www.phprpc.net/                         #  
#           http://www.phprpc.com/                         #  
#           http://sourceforge.net/projects/php-rpc/       #  
#                                                          #  
# Authors:  Ma Bingyao <andot@ujn.edu.cn>                  #  
#                                                          #  
# This file may be distributed and/or modified under the   #  
# terms of the GNU Lesser General Public License (LGPL)    #  
# version 3.0 as published by the Free Software Foundation #  
# and appearing in the included file LICENSE.              #  
#                                                          #  
# ##########################################################
#  
# XXTEA encryption arithmetic library.  
#  
# Copyright (C) 2005-2008 Ma Bingyao <andot@ujn.edu.cn>  
# Version: 1.0  
# LastModified: Oct 5, 2008  
# This library is free.  You can redistribute it and/or modify it.  
  
import struct
import os
import logging
import sys

logging.basicConfig(level=logging.INFO, format='%(asctime)s %(levelname)s %(message)s',
                    datefmt='%Y %H:%M:%S')

class XXTEAEncrypt:
    __key = ""
    __sign = ""
    __DELTA = 0x9E3779B9

    def __init__(self, key, sign):
        self.__key = key
        self.__sign = sign

    @staticmethod
    def _long2str(v, w):
        n = (len(v) - 1) << 2
        if w:
            m = v[-1]
            if (m < n - 3) or (m > n):
                return ''
            n = m
        s = struct.pack('<%iL' % len(v), *v)
        return s[0:n] if w else s

    @staticmethod
    def _str2long(s, w):
        n = len(s)
        m = (4 - (n & 3) & 3) + n
        s = s.ljust(m, "\0")
        v = list(struct.unpack('<%iL' % (m >> 2), s))
        if w:
            v.append(n)
        return v

    def _encrypt(self, data):

        if data == '':
            return data
        v = self._str2long(data, True)
        k = self._str2long(self.__key.ljust(16, "\0"), False)
        n = len(v) - 1
        z = v[n]
        y = v[0]
        sum_value = 0
        q = 6 + 52 // (n + 1)
        while q > 0:
            sum_value = (sum_value + self.__DELTA) & 0xffffffff
            e = sum_value >> 2 & 3
            for p in xrange(n):
                y = v[p + 1]
                v[p] = (v[p] + ((z >> 5 ^ y << 2) + (y >> 3 ^ z << 4) ^ (sum_value ^ y) + (k[p & 3 ^ e] ^ z))) & 0xffffffff
                z = v[p]
            y = v[0]
            v[n] = (v[n] + ((z >> 5 ^ y << 2) + (y >> 3 ^ z << 4) ^ (sum_value ^ y) + (k[n & 3 ^ e] ^ z))) & 0xffffffff
            z = v[n]
            q -= 1
        return self._long2str(v, False)

    def _decrypt(self, encrypt_data):
        if encrypt_data == '':
            return encrypt_data

        v = self._str2long(encrypt_data, False)
        k = self._str2long(self.__key.ljust(16, "\0"), False)
        n = len(v) - 1
        z = v[n]
        y = v[0]
        q = 6 + 52 // (n + 1)
        sum_value = (q * self.__DELTA) & 0xffffffff
        while sum_value != 0:
            e = sum_value >> 2 & 3
            for p in xrange(n, 0, -1):
                z = v[p - 1]
                v[p] = (v[p] - ((z >> 5 ^ y << 2) + (y >> 3 ^ z << 4) ^ (sum_value ^ y) + (k[p & 3 ^ e] ^ z))) & 0xffffffff
                y = v[p]
            z = v[n]
            v[0] = (v[0] - ((z >> 5 ^ y << 2) + (y >> 3 ^ z << 4) ^ (sum_value ^ y) + (k[0 & 3 ^ e] ^ z))) & 0xffffffff
            y = v[0]
            sum_value = (sum_value - self.__DELTA) & 0xffffffff
        return self._long2str(v, True)

    def encrypt_file(self, filename):
        if not (os.path.isfile(filename) and os.path.exists(filename)):
            logging.error("file:%s was not existed!", filename)
            return False

        result = False
        with open(filename, "rb+") as file_handle:
            file_content = file_handle.read()
            encrypt_data = self.__sign + self._encrypt(file_content)
            file_handle.seek(0)
            file_handle.truncate()
            file_handle.write(encrypt_data)
            result = True
            logging.info("Encrypted file: %s successed!", filename)

        if result is False:
            logging.error("Encrypted file: %s failed!", filename)

        return result

    def decrypt_file(self, filename):
        if not (os.path.isfile(filename) and os.path.exists(filename)):
            logging.error("Decrypt file:%s was not existed!", filename)
            return False

        result = False
        with open(filename, "rb+") as file_handle:
            file_content = file_handle.read()
            decrypt_data = self.__sign + self._decrypt(file_content)
            file_handle.seek(0)
            file_handle.truncate()
            file_handle.write(decrypt_data)
            result = True
            logging.info("Decrypted file: %s successed!", filename)

        if result is False:
            logging.error("Decrypted file: %s failed!", filename)

        return result

    def encrypt_dir(self, dir_name, str_filter):
        if not os.path.exists(dir_name):
            return False

        ary_filter = str_filter.split("|")
        ret = True
        for rt, dirs, files in os.walk(dir_name):
            for filename in files:
                file_path = os.path.join(rt, filename)
                ext = os.path.splitext(file_path)[1]
                if ext in ary_filter:
                    if not self.encrypt_file(file_path):
                        ret = False
                        break
        if ret is False:
            logging.error("Encrypt dir failed!Abort.")

        return ret

if __name__ == "__main__":
    print sys.argv[1]
    print sys.argv[2]
    print sys.argv[3]
    resEncrypt = XXTEAEncrypt(sys.argv[1], sys.argv[2])
    resEncrypt.encrypt_dir(sys.argv[3], ".png|.plist|.jpg")